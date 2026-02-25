import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CLASS_EVENT_PUBLIC_SELECT } from '../common/constants';
import { ListClassEventsDto } from './dto/list-class-events.dto';

@Injectable()
export class ClassEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListClassEventsDto) {
    // 1. Start with PUBLISHED+FINISHED only — NEVER include DRAFT
    const where: Prisma.ClassEventWhereInput = {
      publicationStatus: { in: ['PUBLISHED', 'FINISHED'] },
    };

    // 2. Optional entity filters
    if (query.institutionId) {
      where.institutionId = query.institutionId;
    }
    if (query.subjectId) {
      where.subjectId = query.subjectId;
    }
    if (query.teacherProfileId) {
      where.teacherProfileId = query.teacherProfileId;
    }

    // 3. Date range filters
    if (query.dateFrom || query.dateTo) {
      const startsAt: Prisma.DateTimeFilter = {};
      if (query.dateFrom) {
        startsAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        startsAt.lte = new Date(query.dateTo);
      }
      where.startsAt = startsAt;
    }

    // 4. Price range filters
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      const priceCents: Prisma.IntFilter = {};
      if (query.priceMin !== undefined) {
        priceCents.gte = query.priceMin;
      }
      if (query.priceMax !== undefined) {
        priceCents.lte = query.priceMax;
      }
      where.priceCents = priceCents;
    }

    // 5. Query with CLASS_EVENT_PUBLIC_SELECT — meetingUrl excluded
    return this.prisma.classEvent.findMany({
      where,
      select: CLASS_EVENT_PUBLIC_SELECT,
      orderBy: { startsAt: 'desc' },
    });
  }

  async findOne(id: string) {
    // 1. Query class event with public select plus related data
    const event = await this.prisma.classEvent.findFirst({
      where: {
        id,
        // Must be PUBLISHED or FINISHED — do not return DRAFT via direct ID lookup
        publicationStatus: { in: ['PUBLISHED', 'FINISHED'] },
      },
      select: {
        ...CLASS_EVENT_PUBLIC_SELECT,
        institution: {
          select: { id: true, name: true, shortName: true },
        },
        subject: {
          select: { id: true, name: true, icon: true },
        },
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
    });

    if (!event) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Class event not found',
      });
    }

    // 2. Reshape response to match spec
    const { institution, subject, teacherProfile, ...classEventFields } =
      event;

    // 3. Compute seat info — capacity is always present (non-nullable in schema)
    const isSoldOut = classEventFields.soldSeats >= classEventFields.capacity;
    const spotsLeft = classEventFields.capacity - classEventFields.soldSeats;

    return {
      classEvent: {
        ...classEventFields,
        isSoldOut,
        spotsLeft,
      },
      institution,
      subject,
      teacher: {
        id: teacherProfile.id,
        photo: teacherProfile.photo,
        headline: teacherProfile.headline,
        bio: teacherProfile.bio,
        isVerified: teacherProfile.isVerified,
        userName: teacherProfile.user.name,
      },
    };
  }
}
