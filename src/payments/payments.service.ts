import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Confirm mock payment for an enrollment.
   *
   * Atomic transaction:
   * 1. Update enrollment PENDING -> PAID, clear expiresAt
   * 2. Increment soldSeats atomically
   * 3. Post-check: rollback if capacity overflow
   * 4. Create Payment record with MOCK provider, SUCCEEDED status, paidAt
   *
   * Idempotent: if enrollment is already PAID, returns existing payment
   * without double-incrementing soldSeats.
   */
  async confirmPayment(enrollmentId: string, studentProfileId: string) {
    // 1. Validate enrollment exists
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        classEvent: { select: { id: true, priceCents: true } },
      },
    });

    if (!enrollment) {
      throw new NotFoundException({
        error: 'NOT_FOUND',
        message: 'Enrollment not found',
      });
    }

    // 2. Verify ownership
    if (enrollment.studentProfileId !== studentProfileId) {
      throw new ForbiddenException({
        error: 'FORBIDDEN',
        message: 'Not your enrollment',
      });
    }

    // 3. Idempotency: if already PAID, return existing payment (no double increment)
    if (enrollment.status === 'PAID') {
      const existingPayment = await this.prisma.payment.findUnique({
        where: { enrollmentId },
      });

      return { enrollment, payment: existingPayment };
    }

    // 4. Validate enrollment is PENDING and not expired
    if (enrollment.status !== 'PENDING') {
      throw new UnprocessableEntityException({
        error: 'BUSINESS_RULE_VIOLATION',
        message: 'Enrollment is not in PENDING status',
      });
    }

    const now = new Date();
    if (enrollment.expiresAt && enrollment.expiresAt <= now) {
      throw new UnprocessableEntityException({
        error: 'BUSINESS_RULE_VIOLATION',
        message: 'Enrollment reservation has expired',
      });
    }

    // 5. Atomic transaction: update enrollment, increment soldSeats, create payment
    const result = await this.prisma.$transaction(async (tx) => {
      // Update enrollment to PAID, clear expiresAt
      const updatedEnrollment = await tx.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'PAID', expiresAt: null },
      });

      // Atomic increment soldSeats
      const classEvent = await tx.classEvent.update({
        where: { id: updatedEnrollment.classEventId },
        data: { soldSeats: { increment: 1 } },
      });

      // Post-check: rollback if capacity overflow (race-safe)
      if (classEvent.capacity !== null && classEvent.soldSeats > classEvent.capacity) {
        throw new UnprocessableEntityException({
          error: 'BUSINESS_RULE_VIOLATION',
          message: 'Class event is full',
        });
      }

      // Create Payment record
      const payment = await tx.payment.create({
        data: {
          enrollmentId,
          provider: 'MOCK',
          amountCents: classEvent.priceCents,
          status: 'SUCCEEDED',
          paidAt: new Date(),
        },
      });

      return { enrollment: updatedEnrollment, payment };
    });

    return result;
  }
}
