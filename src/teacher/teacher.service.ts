import { Injectable } from '@nestjs/common';
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
}
