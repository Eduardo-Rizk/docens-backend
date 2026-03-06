import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';

@Injectable()
export class TeacherProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async update(teacherProfileId: string, dto: UpdateTeacherProfileDto) {
    // Build scalar update data conditionally
    const scalarData: Prisma.TeacherProfileUpdateInput = {};
    if (dto.bio !== undefined) scalarData.bio = dto.bio;
    if (dto.headline !== undefined) scalarData.headline = dto.headline;
    if (dto.photo !== undefined) scalarData.photo = dto.photo;
    if (dto.photoUrl !== undefined) scalarData.photoUrl = dto.photoUrl;
    if (dto.labels !== undefined) {
      scalarData.labels = this.normalizeLabels(dto.labels);
    }

    // Run junction table sync + scalar update in a transaction
    // The update/findUniqueOrThrow inside will throw P2025 if profile doesn't exist
    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update scalar fields (also serves as existence check)
        if (Object.keys(scalarData).length > 0) {
          await tx.teacherProfile.update({
            where: { id: teacherProfileId },
            data: scalarData,
          });
        } else {
          // Ensure profile exists even when no scalar changes
          await tx.teacherProfile.findUniqueOrThrow({
            where: { id: teacherProfileId },
            select: { id: true },
          });
        }

        // Sync institution junction table (delete-all + recreate)
        if (dto.institutionIds !== undefined) {
          await tx.teacherInstitution.deleteMany({
            where: { teacherProfileId },
          });
          if (dto.institutionIds.length > 0) {
            await tx.teacherInstitution.createMany({
              data: dto.institutionIds.map((institutionId) => ({
                teacherProfileId,
                institutionId,
              })),
            });
          }
        }

        // Sync subject junction table (delete-all + recreate)
        if (dto.subjectIds !== undefined) {
          await tx.teacherSubject.deleteMany({
            where: { teacherProfileId },
          });
          if (dto.subjectIds.length > 0) {
            await tx.teacherSubject.createMany({
              data: dto.subjectIds.map((subjectId) => ({
                teacherProfileId,
                subjectId,
              })),
            });
          }
        }
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException({
          error: 'NOT_FOUND',
          message: 'Teacher profile not found',
        });
      }
      throw err;
    }

    // Fetch updated profile with relations and computed stats
    return this.getProfileWithStats(teacherProfileId);
  }

  private async getProfileWithStats(teacherProfileId: string) {
    const profile = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherProfileId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        institutions: {
          include: {
            institution: true,
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    // Compute stats from ClassEvent aggregation
    const [totalClasses, openClasses, subjectCount] = await Promise.all([
      this.prisma.classEvent.count({
        where: { teacherProfileId },
      }),
      this.prisma.classEvent.count({
        where: {
          teacherProfileId,
          publicationStatus: 'PUBLISHED',
        },
      }),
      this.prisma.classEvent
        .groupBy({
          by: ['subjectId'],
          where: { teacherProfileId },
        })
        .then((groups) => groups.length),
    ]);

    return {
      ...profile,
      stats: {
        totalClasses,
        openClasses,
        totalSubjects: subjectCount,
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
