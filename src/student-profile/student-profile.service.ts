import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Injectable()
export class StudentProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async update(studentProfileId: string, dto: UpdateStudentProfileDto) {
    // Verify the profile exists
    const existing = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        institutions: { select: { institutionId: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Student profile not found',
      });
    }

    // Validate preferredInstitutionId is within institutionIds
    if (dto.preferredInstitutionId !== undefined) {
      const targetInstitutionIds =
        dto.institutionIds ?? existing.institutions.map((i) => i.institutionId);

      if (!targetInstitutionIds.includes(dto.preferredInstitutionId)) {
        throw new UnprocessableEntityException({
          error: 'BUSINESS_RULE_VIOLATION',
          message: 'preferredInstitutionId must be in institutionIds',
        });
      }
    }

    // Build scalar update data conditionally
    const scalarData: Prisma.StudentProfileUpdateInput = {};
    if (dto.preferredInstitutionId !== undefined) {
      scalarData.preferredInstitution = {
        connect: { id: dto.preferredInstitutionId },
      };
    }
    if (dto.labels !== undefined) {
      scalarData.labels = this.normalizeLabels(dto.labels);
    }

    // Name lives on User, not StudentProfile — update via relation
    const userName = dto.name;

    // Run junction table sync + scalar update in a transaction
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update StudentProfile scalars
      if (Object.keys(scalarData).length > 0) {
        await tx.studentProfile.update({
          where: { id: studentProfileId },
          data: scalarData,
        });
      }

      // Update user name if provided
      if (userName !== undefined) {
        await tx.user.update({
          where: {
            id: existing.userId,
          },
          data: { name: userName },
        });
      }

      // Sync institution junction table (delete-all + recreate)
      if (dto.institutionIds !== undefined) {
        await tx.studentInstitution.deleteMany({
          where: { studentProfileId },
        });
        if (dto.institutionIds.length > 0) {
          await tx.studentInstitution.createMany({
            data: dto.institutionIds.map((institutionId) => ({
              studentProfileId,
              institutionId,
            })),
          });
        }
      }
    });

    // Fetch updated profile with relations and computed stats
    return this.getProfileWithStats(studentProfileId);
  }

  private async getProfileWithStats(studentProfileId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        institutions: {
          include: {
            institution: true,
          },
        },
      },
    });

    // Compute stats from Enrollment aggregation
    const [enrollmentCount, completedClassesCount] = await Promise.all([
      this.prisma.enrollment.count({
        where: {
          studentProfileId,
          status: 'PAID',
        },
      }),
      this.prisma.enrollment.count({
        where: {
          studentProfileId,
          status: 'PAID',
          classEvent: {
            publicationStatus: 'FINISHED',
          },
        },
      }),
    ]);

    return {
      ...profile,
      institutionIds: profile?.institutions.map((i) => i.institutionId) ?? [],
      stats: {
        enrollmentCount,
        completedClassesCount,
      },
    };
  }

  /**
   * Normalize labels: trim whitespace, collapse internal whitespace,
   * deduplicate case-insensitively, enforce max 15.
   */
  private normalizeLabels(labels: string[]): string[] {
    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const label of labels) {
      const trimmed = label.trim().replace(/\s+/g, ' ');
      if (!trimmed) continue;

      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      normalized.push(trimmed);

      if (normalized.length >= 15) break;
    }

    return normalized;
  }
}
