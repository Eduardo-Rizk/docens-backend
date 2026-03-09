import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findCourses(institutionId: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, name: true, shortName: true, type: true, isEnabled: true },
    });

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    const courses = await this.prisma.course.findMany({
      where: { institutionId },
      select: {
        id: true,
        name: true,
        slug: true,
        displayOrder: true,
        _count: { select: { subjects: true } },
      },
      orderBy: { displayOrder: 'asc' },
    });

    // For each course, compute semesterCount (distinct yearOrder) and subjectCount
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const semesters = await this.prisma.institutionSubject.findMany({
          where: { courseId: course.id },
          select: { yearOrder: true },
          distinct: ['yearOrder'],
        });

        return {
          id: course.id,
          name: course.name,
          slug: course.slug,
          displayOrder: course.displayOrder,
          semesterCount: semesters.length,
          subjectCount: course._count.subjects,
        };
      }),
    );

    return { institution, courses: coursesWithCounts };
  }

  async findSemesters(institutionId: string, courseId: string) {
    const [institution, course] = await Promise.all([
      this.prisma.institution.findUnique({
        where: { id: institutionId },
        select: { id: true, name: true, shortName: true },
      }),
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, name: true, slug: true, institutionId: true },
      }),
    ]);

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    if (!course || course.institutionId !== institutionId) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    // Group institution subjects by yearOrder to get semesters
    const subjects = await this.prisma.institutionSubject.findMany({
      where: { courseId },
      select: { yearOrder: true, yearLabel: true },
      orderBy: { yearOrder: 'asc' },
    });

    // Build semester list with subject counts
    const semesterMap = new Map<number, { yearOrder: number; yearLabel: string; subjectCount: number }>();
    for (const s of subjects) {
      const existing = semesterMap.get(s.yearOrder);
      if (existing) {
        existing.subjectCount++;
      } else {
        semesterMap.set(s.yearOrder, {
          yearOrder: s.yearOrder,
          yearLabel: s.yearLabel,
          subjectCount: 1,
        });
      }
    }

    return {
      institution,
      course: { id: course.id, name: course.name, slug: course.slug },
      semesters: Array.from(semesterMap.values()),
    };
  }

  async findSemesterSubjects(
    institutionId: string,
    courseId: string,
    yearOrder: number,
  ) {
    const [institution, course] = await Promise.all([
      this.prisma.institution.findUnique({
        where: { id: institutionId },
        select: { id: true, name: true, shortName: true },
      }),
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true, name: true, slug: true, institutionId: true },
      }),
    ]);

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    if (!course || course.institutionId !== institutionId) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Course not found',
      });
    }

    const [institutionSubjects, teacherCounts] = await Promise.all([
      this.prisma.institutionSubject.findMany({
        where: { courseId, yearOrder },
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

    // Build teacher count map
    const countMap = new Map<string, Set<string>>();
    for (const row of teacherCounts) {
      if (!countMap.has(row.subjectId)) {
        countMap.set(row.subjectId, new Set());
      }
      countMap.get(row.subjectId)!.add(row.teacherProfileId);
    }

    const yearLabel = institutionSubjects[0]?.yearLabel ?? `Semestre ${yearOrder}`;

    const subjects = institutionSubjects.map((is) => ({
      subjectId: is.subject.id,
      subjectName: is.subject.name,
      subjectIcon: is.subject.icon,
      teacherCount: countMap.get(is.subject.id)?.size ?? 0,
    }));

    return {
      institution,
      course: { id: course.id, name: course.name, slug: course.slug },
      yearOrder,
      yearLabel,
      subjects,
    };
  }
}
