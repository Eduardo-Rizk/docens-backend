import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListInstitutionsDto } from './dto/list-institutions.dto';

@Injectable()
export class InstitutionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListInstitutionsDto) {
    const where: Prisma.InstitutionWhereInput = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { shortName: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.institution.findMany({
      where,
      select: {
        id: true,
        name: true,
        shortName: true,
        city: true,
        type: true,
        logoUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        shortName: true,
        city: true,
        type: true,
        logoUrl: true,
      },
    });

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    return institution;
  }

  async findSubjects(institutionId: string) {
    // Verify institution exists
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, name: true, shortName: true, type: true },
    });

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    // Fetch institution subjects with nested subject data
    const institutionSubjects = await this.prisma.institutionSubject.findMany({
      where: { institutionId },
      select: {
        yearLabel: true,
        yearOrder: true,
        subject: { select: { id: true, name: true, icon: true } },
      },
      orderBy: [{ yearOrder: 'asc' }, { subject: { name: 'asc' } }],
    });

    // Compute teacherCount per subject from ClassEvent (not junction tables)
    // Count distinct teacherProfileId per subjectId for PUBLISHED/FINISHED events
    const teacherCounts = await this.prisma.classEvent.groupBy({
      by: ['subjectId', 'teacherProfileId'],
      where: {
        institutionId,
        publicationStatus: { in: ['PUBLISHED', 'FINISHED'] },
      },
    });

    // Build map: subjectId -> Set<teacherProfileId>
    const countMap = new Map<string, Set<string>>();
    for (const row of teacherCounts) {
      if (!countMap.has(row.subjectId)) {
        countMap.set(row.subjectId, new Set());
      }
      countMap.get(row.subjectId)!.add(row.teacherProfileId);
    }

    // Return flat array matching frontend InstitutionSubject[] shape
    // Deduplicate subjects (same subject can appear in multiple yearLabels)
    const seen = new Set<string>();
    const result: {
      subjectId: string;
      subjectName: string;
      teacherCount: number;
    }[] = [];

    for (const is of institutionSubjects) {
      if (!seen.has(is.subject.id)) {
        seen.add(is.subject.id);
        result.push({
          subjectId: is.subject.id,
          subjectName: is.subject.name,
          teacherCount: countMap.get(is.subject.id)?.size ?? 0,
        });
      }
    }

    return result;
  }
}
