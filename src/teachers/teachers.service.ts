import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CLASS_EVENT_PUBLIC_SELECT } from '../common/constants';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByInstitutionAndSubject(institutionId: string, subjectId: string) {
    // 1. Verify institution exists
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, shortName: true },
    });

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    // 2. Verify subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, name: true, icon: true },
    });

    if (!subject) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Subject not found',
      });
    }

    // 3. Find all PUBLISHED+FINISHED ClassEvents for this institution+subject
    const events = await this.prisma.classEvent.findMany({
      where: {
        institutionId,
        subjectId,
        publicationStatus: { in: ['PUBLISHED', 'FINISHED'] },
      },
      select: {
        ...CLASS_EVENT_PUBLIC_SELECT,
        teacherProfile: {
          select: {
            id: true,
            photo: true,
            headline: true,
            bio: true,
            isVerified: true,
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { startsAt: 'asc' },
    });

    // 4. Group events by teacherProfileId
    const teacherMap = new Map<
      string,
      {
        teacher: {
          id: string;
          photo: string;
          headline: string;
          bio: string;
          isVerified: boolean;
          userName: string;
        };
        events: (typeof events)[number][];
      }
    >();

    for (const event of events) {
      const { teacherProfile, ...eventData } = event;
      if (!teacherMap.has(teacherProfile.id)) {
        teacherMap.set(teacherProfile.id, {
          teacher: {
            id: teacherProfile.id,
            photo: teacherProfile.photo,
            headline: teacherProfile.headline,
            bio: teacherProfile.bio,
            isVerified: teacherProfile.isVerified,
            userName: teacherProfile.user.name,
          },
          events: [],
        });
      }
      teacherMap.get(teacherProfile.id)!.events.push(event);
    }

    const now = new Date();

    // 5. For each teacher, compute openClassCount and nextEvent
    const teachers = Array.from(teacherMap.values()).map((entry) => {
      const futurePublished = entry.events.filter(
        (e) =>
          e.publicationStatus === 'PUBLISHED' && new Date(e.startsAt) > now,
      );

      // Events are ordered by startsAt asc, so first future published is next
      const next = futurePublished.length > 0 ? futurePublished[0] : null;
      const nextEvent = next
        ? {
            id: next.id,
            title: next.title,
            startsAt: next.startsAt,
            durationMin: next.durationMin,
            priceCents: next.priceCents,
            capacity: next.capacity,
            soldSeats: next.soldSeats,
          }
        : null;

      // Strip teacherProfile from events before returning
      const cleanEvents = entry.events.map(
        ({ teacherProfile: _tp, ...rest }) => rest,
      );

      return {
        ...entry.teacher,
        openClassCount: futurePublished.length,
        nextEvent,
        events: cleanEvents,
      };
    });

    // 6. Return response
    return {
      institution,
      subject,
      totalTeachers: teachers.length,
      totalClasses: events.length,
      teachers,
    };
  }

  async findOne(institutionId: string, teacherProfileId: string) {
    // 1. Verify teacher profile exists
    const teacherProfile = await this.prisma.teacherProfile.findUnique({
      where: { id: teacherProfileId },
      select: {
        id: true,
        photo: true,
        headline: true,
        bio: true,
        isVerified: true,
        user: { select: { name: true } },
      },
    });

    if (!teacherProfile) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Teacher profile not found',
      });
    }

    // 2. Verify institution exists
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, name: true, shortName: true },
    });

    if (!institution) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Institution not found',
      });
    }

    // 3. Get all PUBLISHED+FINISHED ClassEvents for this teacher at this institution
    const events = await this.prisma.classEvent.findMany({
      where: {
        teacherProfileId,
        institutionId,
        publicationStatus: { in: ['PUBLISHED', 'FINISHED'] },
      },
      select: {
        ...CLASS_EVENT_PUBLIC_SELECT,
        subject: { select: { id: true, name: true, icon: true } },
      },
      orderBy: { startsAt: 'asc' },
    });

    // 4. Group events by subjectId into classesBySubject
    const subjectMap = new Map<
      string,
      {
        subject: { id: string; name: string; icon: string | null };
        events: Omit<(typeof events)[number], 'subject'>[];
      }
    >();

    for (const event of events) {
      const { subject: eventSubject, ...eventData } = event;
      if (!subjectMap.has(eventSubject.id)) {
        subjectMap.set(eventSubject.id, {
          subject: eventSubject,
          events: [],
        });
      }
      subjectMap.get(eventSubject.id)!.events.push(eventData);
    }

    const classesBySubject = Array.from(subjectMap.values());

    const now = new Date();

    // 5. Compute stats
    const openSpots = events.filter(
      (e) =>
        e.publicationStatus === 'PUBLISHED' &&
        new Date(e.startsAt) > now &&
        (e.capacity === null || e.soldSeats < e.capacity),
    ).length;

    const stats = {
      totalClasses: events.length,
      totalSubjects: subjectMap.size,
      openSpots,
    };

    // 6. Return response
    return {
      teacher: {
        id: teacherProfile.id,
        photo: teacherProfile.photo,
        headline: teacherProfile.headline,
        bio: teacherProfile.bio,
        isVerified: teacherProfile.isVerified,
        userName: teacherProfile.user.name,
      },
      institution,
      stats,
      classesBySubject,
    };
  }
}
