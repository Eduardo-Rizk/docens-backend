import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { activeEnrollmentWhere } from '../common/constants';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

const ENROLLMENT_EXPIRATION_MINUTES = 15;

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new enrollment for a student in a published class event.
   *
   * Business rules:
   * - Class event must exist and be PUBLISHED
   * - Capacity check: active enrollments (PAID + non-expired PENDING) must be < capacity
   * - Duplicate detection via P2002 unique constraint
   * - Expired PENDING re-enrollment: delete expired + create fresh
   */
  async create(studentProfileId: string, dto: CreateEnrollmentDto) {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + ENROLLMENT_EXPIRATION_MINUTES * 60 * 1000,
    );

    // 1. Verify class event exists
    const classEvent = await this.prisma.classEvent.findUnique({
      where: { id: dto.classEventId },
    });

    if (!classEvent) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Class event not found',
      });
    }

    // 2. Must be PUBLISHED to accept enrollments
    if (classEvent.publicationStatus !== 'PUBLISHED') {
      throw new UnprocessableEntityException({
        error: 'BUSINESS_RULE_VIOLATION',
        message:
          classEvent.publicationStatus === 'FINISHED'
            ? 'This class event has already finished'
            : 'Class event is not published',
      });
    }

    // 2. Check capacity (count active enrollments using lazy expiration filter)
    const activeCount = await this.prisma.enrollment.count({
      where: {
        classEventId: dto.classEventId,
        ...activeEnrollmentWhere(now),
      },
    });

    if (classEvent.capacity !== null && activeCount >= classEvent.capacity) {
      throw new UnprocessableEntityException({
        error: 'BUSINESS_RULE_VIOLATION',
        message: 'Class event is full',
      });
    }

    // 3. Create enrollment with P2002 duplicate handling
    try {
      const enrollment = await this.prisma.enrollment.create({
        data: {
          classEventId: dto.classEventId,
          studentProfileId,
          status: 'PENDING',
          expiresAt,
        },
      });

      return enrollment;
    } catch (err: any) {
      // 4. Handle P2002 (unique constraint violation = duplicate enrollment)
      if (err.code === 'P2002') {
        // Look up the existing enrollment
        const existing = await this.prisma.enrollment.findUnique({
          where: {
            classEventId_studentProfileId: {
              classEventId: dto.classEventId,
              studentProfileId,
            },
          },
        });

        // If existing is PENDING and expired, delete and re-create
        if (
          existing &&
          existing.status === 'PENDING' &&
          existing.expiresAt &&
          existing.expiresAt <= now
        ) {
          await this.prisma.enrollment.delete({
            where: { id: existing.id },
          });

          // Re-create with fresh expiration
          const freshExpiresAt = new Date(
            new Date().getTime() + ENROLLMENT_EXPIRATION_MINUTES * 60 * 1000,
          );

          const newEnrollment = await this.prisma.enrollment.create({
            data: {
              classEventId: dto.classEventId,
              studentProfileId,
              status: 'PENDING',
              expiresAt: freshExpiresAt,
            },
          });

          return newEnrollment;
        }

        // Otherwise, it's a genuine duplicate
        throw new ConflictException({
          error: 'CONFLICT',
          message: 'Already enrolled in this class event',
        });
      }

      throw err;
    }
  }

  /**
   * Find an enrollment by ID with ownership verification.
   * Only the enrollment owner (student) can view their enrollment.
   */
  async findOne(id: string, studentProfileId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        classEvent: {
          select: { title: true, priceCents: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Enrollment not found',
      });
    }

    if (enrollment.studentProfileId !== studentProfileId) {
      throw new ForbiddenException({
        error: 'FORBIDDEN',
        message: 'Not your enrollment',
      });
    }

    return enrollment;
  }
}
