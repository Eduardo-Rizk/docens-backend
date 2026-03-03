import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all class events owned by this teacher, grouped by publicationStatus.
   *
   * NOTE: meetingUrl IS included here — the teacher owns this data.
   * Do NOT use CLASS_EVENT_PUBLIC_SELECT (which excludes meetingUrl).
   */
  async findOwnClassEvents(teacherProfileId: string) {
    const events = await this.prisma.classEvent.findMany({
      where: { teacherProfileId },
      select: {
        id: true,
        title: true,
        description: true,
        startsAt: true,
        durationMin: true,
        priceCents: true,
        capacity: true,
        soldSeats: true,
        publicationStatus: true,
        meetingStatus: true,
        meetingUrl: true, // INCLUDED — teacher owns this data, NOT a leak
        createdAt: true,
        institution: { select: { id: true, shortName: true } },
        subject: { select: { id: true, name: true } },
      },
      orderBy: { startsAt: 'desc' },
    });

    // Group events by publicationStatus in-memory
    const drafts = events.filter((e) => e.publicationStatus === 'DRAFT');
    const published = events.filter((e) => e.publicationStatus === 'PUBLISHED');
    const finished = events.filter((e) => e.publicationStatus === 'FINISHED');

    return { drafts, published, finished };
  }

  /**
   * Teacher dashboard: KPIs + per-aulao breakdown for PUBLISHED/FINISHED events.
   */
  async getDashboard(teacherProfileId: string) {
    const events = await this.prisma.classEvent.findMany({
      where: {
        teacherProfileId,
        publicationStatus: { in: ['PUBLISHED', 'FINISHED'] },
      },
      select: {
        id: true,
        title: true,
        subjectId: true,
        institutionId: true,
        startsAt: true,
        durationMin: true,
        priceCents: true,
        capacity: true,
        soldSeats: true,
        publicationStatus: true,
        institution: { select: { shortName: true } },
        subject: { select: { name: true } },
        enrollments: {
          where: { status: 'PAID' },
          select: {
            id: true,
            payment: { select: { amountCents: true, status: true } },
          },
        },
      },
      orderBy: { startsAt: 'desc' },
    });

    const rows = events.map((event) => {
      const paidEnrollments = event.enrollments.length;
      const revenueSucceededCents = event.enrollments.reduce((sum, e) => {
        return (
          sum +
          (e.payment?.status === 'SUCCEEDED' ? e.payment.amountCents : 0)
        );
      }, 0);
      const { enrollments: _, ...classEvent } = event;
      return {
        classEvent,
        institution: { shortName: event.institution.shortName },
        subject: { name: event.subject.name },
        paidEnrollments,
        revenueSucceededCents,
      };
    });

    return {
      totalRevenueSucceededCents: rows.reduce(
        (s, r) => s + r.revenueSucceededCents,
        0,
      ),
      totalPaidStudents: rows.reduce((s, r) => s + r.paidEnrollments, 0),
      totalClasses: events.length,
      publishedClasses: events.filter(
        (e) => e.publicationStatus === 'PUBLISHED',
      ).length,
      rows,
    };
  }

  /**
   * Find a single class event owned by this teacher (any status, including DRAFT).
   */
  async findOwnClassEvent(teacherProfileId: string, classEventId: string) {
    const event = await this.prisma.classEvent.findFirst({
      where: { id: classEventId, teacherProfileId },
      select: {
        id: true,
        title: true,
        description: true,
        startsAt: true,
        durationMin: true,
        priceCents: true,
        capacity: true,
        soldSeats: true,
        publicationStatus: true,
        meetingStatus: true,
        meetingUrl: true,
        createdAt: true,
        institution: { select: { id: true, name: true, shortName: true } },
        subject: { select: { id: true, name: true, icon: true } },
      },
    });
    if (!event) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Class event not found or not owned by teacher',
      });
    }

    const { institution, subject, ...classEventFields } = event;
    const isSoldOut =
      classEventFields.capacity !== null
        ? classEventFields.soldSeats >= classEventFields.capacity
        : false;
    const spotsLeft =
      classEventFields.capacity !== null
        ? classEventFields.capacity - classEventFields.soldSeats
        : null;

    return {
      classEvent: { ...classEventFields, isSoldOut, spotsLeft },
      institution,
      subject,
    };
  }

  /**
   * Buyer list for a teacher's class event.
   * Verifies ownership before returning enrolled students.
   */
  async getBuyers(teacherProfileId: string, classEventId: string) {
    const classEvent = await this.prisma.classEvent.findFirst({
      where: { id: classEventId, teacherProfileId },
      select: {
        id: true,
        title: true,
        startsAt: true,
        institution: { select: { shortName: true } },
        subject: { select: { name: true } },
      },
    });
    if (!classEvent) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Class event not found or not owned by teacher',
      });
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classEventId },
      select: {
        id: true,
        status: true,
        studentProfile: {
          select: { user: { select: { name: true, email: true } } },
        },
        payment: {
          select: {
            amountCents: true,
            provider: true,
            status: true,
            paidAt: true,
          },
        },
      },
    });

    const paidCount = enrollments.filter((e) => e.status === 'PAID').length;
    const buyers = enrollments.map((e) => ({
      enrollment: { id: e.id, status: e.status },
      user: {
        name: e.studentProfile.user.name,
        email: e.studentProfile.user.email,
      },
      payment: e.payment
        ? {
            amountCents: e.payment.amountCents,
            provider: e.payment.provider,
            status: e.payment.status,
          }
        : null,
    }));

    return {
      classEvent: {
        id: classEvent.id,
        title: classEvent.title,
        startsAt: classEvent.startsAt,
      },
      institution: { shortName: classEvent.institution.shortName },
      subject: { name: classEvent.subject.name },
      paidCount,
      buyers,
    };
  }
}
