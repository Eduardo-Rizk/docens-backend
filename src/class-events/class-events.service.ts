import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CLASS_EVENT_PUBLIC_SELECT,
  CORE_FIELDS,
  PUBLICATION_TRANSITIONS,
  MEETING_TRANSITIONS,
  ACTION_MAP,
} from '../common/constants';
import { ListClassEventsDto } from './dto/list-class-events.dto';
import { CreateClassEventDto } from './dto/create-class-event.dto';
import {
  UpdateClassEventDto,
  ClassEventAction,
} from './dto/update-class-event.dto';

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
    const { institution, subject, teacherProfile, ...classEventFields } = event;

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

  /**
   * Check if a proposed time slot overlaps with any existing class events
   * for the same teacher. Back-to-back events (exact boundary match) are
   * NOT considered overlapping — uses strict > comparison.
   *
   * Public so Plan 03 can reuse it for PATCH time edits.
   */
  async checkOverlap(
    teacherProfileId: string,
    startsAt: Date,
    durationMin: number,
    excludeEventId?: string,
  ): Promise<boolean> {
    const endAt = new Date(startsAt.getTime() + durationMin * 60 * 1000);

    const where: Prisma.ClassEventWhereInput = {
      teacherProfileId,
      startsAt: { lt: endAt }, // existing event starts before new event ends
    };

    if (excludeEventId) {
      where.id = { not: excludeEventId };
    }

    const candidates = await this.prisma.classEvent.findMany({
      where,
      select: { id: true, startsAt: true, durationMin: true },
    });

    // Check if existing event's end > new event's start (strict > for back-to-back allowance)
    return candidates.some((event) => {
      const existingEnd = new Date(
        event.startsAt.getTime() + event.durationMin * 60 * 1000,
      );
      return existingEnd > startsAt;
    });
  }

  /**
   * Create a new class event in DRAFT status with overlap validation.
   */
  async create(teacherProfileId: string, dto: CreateClassEventDto) {
    const startsAt = new Date(dto.startsAt);

    // 1. Validate overlap — all statuses block time slots per CONTEXT.md
    const hasOverlap = await this.checkOverlap(
      teacherProfileId,
      startsAt,
      dto.durationMin,
    );
    if (hasOverlap) {
      throw new UnprocessableEntityException({
        error: 'BUSINESS_RULE_VIOLATION',
        message: 'This class event overlaps with another of your events',
      });
    }

    // 2. Create the event in DRAFT status (default in schema)
    return this.prisma.classEvent.create({
      data: {
        title: dto.title,
        description: dto.description,
        teacherProfileId,
        subjectId: dto.subjectId,
        institutionId: dto.institutionId,
        startsAt,
        durationMin: dto.durationMin,
        priceCents: dto.priceCents,
        capacity: dto.capacity,
        meetingUrl: dto.meetingUrl ?? null,
        // publicationStatus defaults to DRAFT
        // meetingStatus defaults to LOCKED
        // soldSeats defaults to 0
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Ownership verification
  // ---------------------------------------------------------------------------

  /**
   * Find a class event and verify the requesting teacher owns it.
   * Throws NotFoundException if event doesn't exist, ForbiddenException if not owner.
   */
  private async findOwnedEvent(eventId: string, teacherProfileId: string) {
    const event = await this.prisma.classEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Class event not found',
      });
    }
    if (event.teacherProfileId !== teacherProfileId) {
      throw new ForbiddenException({
        error: 'FORBIDDEN',
        message: 'You can only modify your own class events',
      });
    }
    return event;
  }

  // ---------------------------------------------------------------------------
  // Update (field edits + actions)
  // ---------------------------------------------------------------------------

  /**
   * Update a class event. Supports two mutually exclusive modes:
   * 1. Action mode: execute a state machine transition (publish, unpublish, etc.)
   * 2. Field edit mode: update editable fields (core fields locked after publish)
   */
  async update(
    eventId: string,
    teacherProfileId: string,
    dto: UpdateClassEventDto,
  ) {
    const event = await this.findOwnedEvent(eventId, teacherProfileId);

    // 1. Check mutual exclusivity: action and field edits cannot coexist
    const { action, ...fieldEdits } = dto;
    const hasFieldEdits = Object.values(fieldEdits).some(
      (v) => v !== undefined,
    );

    if (action !== undefined && hasFieldEdits) {
      throw new UnprocessableEntityException({
        error: 'BUSINESS_RULE_VIOLATION',
        message: 'Cannot combine action with field edits in a single request',
      });
    }

    // 2. Action mode — delegate to state machine
    if (action !== undefined) {
      return this.executeAction(event, action);
    }

    // 3. Field edit mode — enforce core field locking after publish
    if (
      event.publicationStatus === 'PUBLISHED' ||
      event.publicationStatus === 'FINISHED'
    ) {
      const coreFieldPresent = CORE_FIELDS.some(
        (field) => (fieldEdits as Record<string, unknown>)[field] !== undefined,
      );
      if (coreFieldPresent) {
        throw new UnprocessableEntityException({
          error: 'BUSINESS_RULE_VIOLATION',
          message:
            'Cannot edit core fields after publishing. Only description and meetingUrl can be changed.',
        });
      }
    }

    // 4. If time fields changed on DRAFT, re-validate overlap
    const newStartsAt = fieldEdits.startsAt
      ? new Date(fieldEdits.startsAt)
      : undefined;
    const newDurationMin = fieldEdits.durationMin;

    if (newStartsAt !== undefined || newDurationMin !== undefined) {
      const effectiveStartsAt = newStartsAt ?? event.startsAt;
      const effectiveDuration = newDurationMin ?? event.durationMin;

      const hasOverlap = await this.checkOverlap(
        teacherProfileId,
        effectiveStartsAt,
        effectiveDuration,
        eventId, // exclude self
      );
      if (hasOverlap) {
        throw new UnprocessableEntityException({
          error: 'BUSINESS_RULE_VIOLATION',
          message: 'This class event overlaps with another of your events',
        });
      }
    }

    // 5. Build update data from non-undefined fields
    const updateData: Prisma.ClassEventUpdateInput = {};
    if (fieldEdits.title !== undefined) updateData.title = fieldEdits.title;
    if (fieldEdits.description !== undefined)
      updateData.description = fieldEdits.description;
    if (fieldEdits.meetingUrl !== undefined)
      updateData.meetingUrl = fieldEdits.meetingUrl;
    if (newStartsAt !== undefined) updateData.startsAt = newStartsAt;
    if (fieldEdits.durationMin !== undefined)
      updateData.durationMin = fieldEdits.durationMin;
    if (fieldEdits.priceCents !== undefined)
      updateData.priceCents = fieldEdits.priceCents;
    if (fieldEdits.capacity !== undefined)
      updateData.capacity = fieldEdits.capacity;
    if (fieldEdits.subjectId !== undefined)
      updateData.subject = { connect: { id: fieldEdits.subjectId } };
    if (fieldEdits.institutionId !== undefined)
      updateData.institution = { connect: { id: fieldEdits.institutionId } };

    return this.prisma.classEvent.update({
      where: { id: eventId },
      data: updateData,
    });
  }

  // ---------------------------------------------------------------------------
  // State machine transitions
  // ---------------------------------------------------------------------------

  /**
   * Execute a state machine action on a class event.
   * Validates the transition is allowed and checks pre-conditions per action.
   */
  private async executeAction(
    event: Awaited<ReturnType<typeof this.findOwnedEvent>>,
    action: ClassEventAction,
  ) {
    const mapping = ACTION_MAP[action];
    const currentStatus = event[mapping.field] as string;
    const transitions =
      mapping.field === 'publicationStatus'
        ? PUBLICATION_TRANSITIONS
        : MEETING_TRANSITIONS;

    // 1. Validate transition is allowed
    const allowed = transitions[currentStatus] ?? [];
    if (!allowed.includes(mapping.targetStatus)) {
      throw new UnprocessableEntityException({
        error: 'BUSINESS_RULE_VIOLATION',
        message: `Invalid status transition: ${currentStatus} cannot move to ${mapping.targetStatus}`,
      });
    }

    // 2. Pre-condition checks per action
    if (action === ClassEventAction.UNPUBLISH) {
      const enrollmentCount = await this.prisma.enrollment.count({
        where: { classEventId: event.id },
      });
      if (enrollmentCount > 0) {
        throw new UnprocessableEntityException({
          error: 'BUSINESS_RULE_VIOLATION',
          message: 'Cannot unpublish: event has enrolled students',
        });
      }
    }

    if (action === ClassEventAction.RELEASE_MEETING) {
      if (!event.meetingUrl) {
        throw new UnprocessableEntityException({
          error: 'BUSINESS_RULE_VIOLATION',
          message:
            'Cannot release meeting: meetingUrl is not set. Set the meeting URL first.',
        });
      }
    }

    if (action === ClassEventAction.FINISH) {
      if (event.meetingStatus !== 'RELEASED') {
        throw new UnprocessableEntityException({
          error: 'BUSINESS_RULE_VIOLATION',
          message:
            'Cannot finish: meeting must be released before finishing the event',
        });
      }
    }

    // 3. Execute the transition
    return this.prisma.classEvent.update({
      where: { id: event.id },
      data: { [mapping.field]: mapping.targetStatus },
    });
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  /**
   * Delete a class event. Only DRAFT events can be deleted.
   */
  async remove(eventId: string, teacherProfileId: string) {
    const event = await this.findOwnedEvent(eventId, teacherProfileId);

    if (event.publicationStatus !== 'DRAFT') {
      throw new UnprocessableEntityException({
        error: 'BUSINESS_RULE_VIOLATION',
        message: 'Only DRAFT events can be deleted',
      });
    }

    await this.prisma.classEvent.delete({ where: { id: eventId } });
    return { message: 'Class event deleted' };
  }
}
