import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByInstitution() {
    const rows = await this.prisma.institutionSubject.findMany({
      select: {
        institutionId: true,
        subjectId: true,
        course: { select: { id: true, name: true } },
      },
    });

    const map: Record<
      string,
      { subjectId: string; courseId: string | null; courseName: string | null }[]
    > = {};

    for (const row of rows) {
      if (!map[row.institutionId]) {
        map[row.institutionId] = [];
      }
      const entry = {
        subjectId: row.subjectId,
        courseId: row.course?.id ?? null,
        courseName: row.course?.name ?? null,
      };
      // Dedupe by subjectId+courseId
      const exists = map[row.institutionId].some(
        (e) => e.subjectId === entry.subjectId && e.courseId === entry.courseId,
      );
      if (!exists) {
        map[row.institutionId].push(entry);
      }
    }
    return map;
  }
}
