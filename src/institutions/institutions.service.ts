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
        isEnabled: true,
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
        isEnabled: true,
        _count: { select: { courses: true } },
      },
    });

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    const { _count, ...rest } = institution;
    return { ...rest, courseCount: _count.courses };
  }

  async findSubjects(institutionId: string) {
    const [institution, institutionSubjects, teacherCounts] = await Promise.all([
      this.prisma.institution.findUnique({
        where: { id: institutionId },
        select: { id: true, name: true, shortName: true, type: true },
      }),
      this.prisma.institutionSubject.findMany({
        where: { institutionId, courseId: null },
        select: {
          yearLabel: true,
          yearOrder: true,
          subject: { select: { id: true, name: true, icon: true } },
        },
        orderBy: [{ yearOrder: 'asc' }, { subject: { name: 'asc' } }],
      }),
      this.prisma.classEvent.groupBy({
        by: ['subjectId', 'teacherProfileId'],
        where: {
          institutionId,
          publicationStatus: { in: ['PUBLISHED', 'FINISHED'] },
        },
      }),
    ]);

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    // Build map: subjectId -> Set<teacherProfileId>
    const countMap = new Map<string, Set<string>>();
    for (const row of teacherCounts) {
      if (!countMap.has(row.subjectId)) {
        countMap.set(row.subjectId, new Set());
      }
      countMap.get(row.subjectId)!.add(row.teacherProfileId);
    }

    // Group by yearLabel for schools
    const yearMap = new Map<
      string,
      { yearLabel: string; yearOrder: number; subjects: { subjectId: string; subjectName: string; subjectIcon: string | null; teacherCount: number }[] }
    >();

    for (const is of institutionSubjects) {
      if (!yearMap.has(is.yearLabel)) {
        yearMap.set(is.yearLabel, {
          yearLabel: is.yearLabel,
          yearOrder: is.yearOrder,
          subjects: [],
        });
      }
      yearMap.get(is.yearLabel)!.subjects.push({
        subjectId: is.subject.id,
        subjectName: is.subject.name,
        subjectIcon: is.subject.icon,
        teacherCount: countMap.get(is.subject.id)?.size ?? 0,
      });
    }

    return {
      institution,
      years: Array.from(yearMap.values()),
    };
  }

  async findYearSubjects(institutionId: string, yearOrder: number) {
    const [institution, institutionSubjects, teacherCounts] = await Promise.all([
      this.prisma.institution.findUnique({
        where: { id: institutionId },
        select: { id: true, name: true, shortName: true, type: true },
      }),
      this.prisma.institutionSubject.findMany({
        where: { institutionId, yearOrder, courseId: null },
        select: {
          yearLabel: true,
          subject: { select: { id: true, name: true, icon: true } },
        },
        orderBy: { subject: { name: 'asc' } },
      }),
      this.prisma.classEvent.groupBy({
        by: ['subjectId', 'teacherProfileId'],
        where: {
          institutionId,
          publicationStatus: { in: ['PUBLISHED', 'FINISHED'] },
        },
      }),
    ]);

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    const countMap = new Map<string, Set<string>>();
    for (const row of teacherCounts) {
      if (!countMap.has(row.subjectId)) {
        countMap.set(row.subjectId, new Set());
      }
      countMap.get(row.subjectId)!.add(row.teacherProfileId);
    }

    const yearLabel = institutionSubjects[0]?.yearLabel ?? `${yearOrder}o Ano`;

    const subjects = institutionSubjects.map((is) => ({
      subjectId: is.subject.id,
      subjectName: is.subject.name,
      subjectIcon: is.subject.icon,
      teacherCount: countMap.get(is.subject.id)?.size ?? 0,
    }));

    return { institution, yearOrder, yearLabel, subjects };
  }
}
