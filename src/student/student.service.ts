import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { activeEnrollmentWhere } from '../common/constants';

/**
 * Compute the student's access state for a class event.
 * Ported from docsens-front/lib/domain.ts getStudentAccessState().
 *
 * State machine:
 *   NEEDS_PURCHASE -> PENDING_PAYMENT -> WAITING_RELEASE -> CAN_ENTER
 */
function computeAccessState(
  classEvent: { startsAt: Date; meetingStatus: string },
  enrollment?: { status: string; expiresAt?: Date | null },
  now: Date = new Date(),
): 'NEEDS_PURCHASE' | 'PENDING_PAYMENT' | 'WAITING_RELEASE' | 'CAN_ENTER' {
  if (!enrollment) return 'NEEDS_PURCHASE';

  if (enrollment.status === 'PENDING') {
    if (enrollment.expiresAt && enrollment.expiresAt <= now) {
      return 'NEEDS_PURCHASE'; // Expired reservation
    }
    return 'PENDING_PAYMENT';
  }

  if (enrollment.status === 'PAID') {
    const startsAt = new Date(classEvent.startsAt);
    if (now >= startsAt && classEvent.meetingStatus === 'RELEASED') {
      return 'CAN_ENTER';
    }
    return 'WAITING_RELEASE';
  }

  return 'NEEDS_PURCHASE'; // CANCELLED, REFUNDED, or unknown
}

export interface AgendaItem {
  enrollment: { id: string; status: string; createdAt: Date } | null;
  classEvent: {
    id: string;
    title: string;
    description: string;
    startsAt: Date;
    durationMin: number;
    priceCents: number;
    capacity: number;
    soldSeats: number;
    publicationStatus: string;
    meetingStatus: string;
    meetingUrl?: string;
  };
  institution: { id: string; shortName: string };
  subject: { id: string; name: string };
  teacher: { userName: string; headline: string };
  accessState:
    | 'NEEDS_PURCHASE'
    | 'PENDING_PAYMENT'
    | 'WAITING_RELEASE'
    | 'CAN_ENTER';
}

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get student agenda: enrolled class events classified into live, upcoming, and history.
   * Each item includes the computed accessState and conditional meetingUrl.
   * Also includes discoverable events from the student's institutions.
   */
  async getAgenda(studentProfileId: string) {
    const now = new Date();

    // 1. Query active enrollments with class event details
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentProfileId,
        ...activeEnrollmentWhere(now),
      },
      include: {
        classEvent: {
          include: {
            institution: { select: { id: true, shortName: true } },
            teacherProfile: {
              select: {
                id: true,
                headline: true,
                user: { select: { name: true } },
              },
            },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    // 2. Map enrolled items to agenda items with accessState and time classification
    const enrolledItems: (AgendaItem & { startsAt: Date; endsAt: Date })[] =
      enrollments.map((enrollment) => {
        const ce = enrollment.classEvent;
        const startsAt = new Date(ce.startsAt);
        const endsAt = new Date(startsAt.getTime() + ce.durationMin * 60_000);
        const accessState = computeAccessState(ce, enrollment, now);

        return {
          enrollment: {
            id: enrollment.id,
            status: enrollment.status,
            createdAt: enrollment.createdAt,
          },
          classEvent: {
            id: ce.id,
            title: ce.title,
            description: ce.description,
            startsAt: ce.startsAt,
            durationMin: ce.durationMin,
            priceCents: ce.priceCents,
            capacity: ce.capacity,
            soldSeats: ce.soldSeats,
            publicationStatus: ce.publicationStatus,
            meetingStatus: ce.meetingStatus,
            // CRITICAL (STUD-03): meetingUrl ONLY for CAN_ENTER
            meetingUrl:
              accessState === 'CAN_ENTER'
                ? (ce.meetingUrl ?? undefined)
                : undefined,
          },
          institution: {
            id: ce.institution.id,
            shortName: ce.institution.shortName,
          },
          subject: { id: ce.subject.id, name: ce.subject.name },
          teacher: {
            userName: ce.teacherProfile.user.name,
            headline: ce.teacherProfile.headline,
          },
          accessState,
          startsAt,
          endsAt,
        };
      });

    // 3. Query discoverable events from the student's institutions
    //    (PUBLISHED events they haven't enrolled in yet, starting in the future)
    const studentInstitutions = await this.prisma.studentInstitution.findMany({
      where: { studentProfileId },
      select: { institutionId: true },
    });

    const institutionIds = studentInstitutions.map((si) => si.institutionId);

    // Get IDs of class events the student already has an active enrollment for
    const enrolledClassEventIds = enrollments.map((e) => e.classEventId);

    let discoverableItems: (AgendaItem & {
      startsAt: Date;
      endsAt: Date;
    })[] = [];

    if (institutionIds.length > 0) {
      const discoverableEvents = await this.prisma.classEvent.findMany({
        where: {
          institutionId: { in: institutionIds },
          publicationStatus: 'PUBLISHED',
          startsAt: { gt: now },
          ...(enrolledClassEventIds.length > 0
            ? { id: { notIn: enrolledClassEventIds } }
            : {}),
        },
        include: {
          institution: { select: { id: true, shortName: true } },
          teacherProfile: {
            select: {
              id: true,
              headline: true,
              user: { select: { name: true } },
            },
          },
          subject: { select: { id: true, name: true } },
        },
      });

      discoverableItems = discoverableEvents.map((ce) => {
        const startsAt = new Date(ce.startsAt);
        const endsAt = new Date(startsAt.getTime() + ce.durationMin * 60_000);

        return {
          enrollment: null,
          classEvent: {
            id: ce.id,
            title: ce.title,
            description: ce.description,
            startsAt: ce.startsAt,
            durationMin: ce.durationMin,
            priceCents: ce.priceCents,
            capacity: ce.capacity,
            soldSeats: ce.soldSeats,
            publicationStatus: ce.publicationStatus,
            meetingStatus: ce.meetingStatus,
            // NEEDS_PURCHASE: no meetingUrl
            meetingUrl: undefined,
          },
          institution: {
            id: ce.institution.id,
            shortName: ce.institution.shortName,
          },
          subject: { id: ce.subject.id, name: ce.subject.name },
          teacher: {
            userName: ce.teacherProfile.user.name,
            headline: ce.teacherProfile.headline,
          },
          accessState: 'NEEDS_PURCHASE' as const,
          startsAt,
          endsAt,
        };
      });
    }

    // 4. Classify by time
    const allItems = [...enrolledItems, ...discoverableItems];

    // Strip internal startsAt/endsAt helpers from the response
    const toAgendaItem = (
      item: AgendaItem & { startsAt: Date; endsAt: Date },
    ): AgendaItem => ({
      enrollment: item.enrollment,
      classEvent: item.classEvent,
      institution: item.institution,
      subject: item.subject,
      teacher: item.teacher,
      accessState: item.accessState,
    });

    const live = allItems
      .filter((item) => now >= item.startsAt && now < item.endsAt)
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
      .map(toAgendaItem);

    const upcoming = allItems
      .filter((item) => item.startsAt > now)
      .sort((a, b) => {
        // Enrolled upcoming first, then discoverable
        const aEnrolled = a.enrollment ? 0 : 1;
        const bEnrolled = b.enrollment ? 0 : 1;
        if (aEnrolled !== bEnrolled) return aEnrolled - bEnrolled;
        return a.startsAt.getTime() - b.startsAt.getTime();
      })
      .map(toAgendaItem);

    const history = allItems
      .filter((item) => item.endsAt <= now)
      .sort((a, b) => b.endsAt.getTime() - a.endsAt.getTime())
      .map(toAgendaItem);

    return { live, upcoming, history };
  }
}
