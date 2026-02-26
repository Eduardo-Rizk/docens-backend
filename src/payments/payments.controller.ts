import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
} from '@nestjs/common';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Mock payment: synchronous confirmation.
  // In production, this would initiate a checkout session with a real gateway
  // (Stripe/MercadoPago) and the confirmation would happen via webhook callback.
  // The atomic transaction pattern in PaymentsService.confirmPayment() would be
  // called from the webhook handler instead of directly from the controller.
  @Post('confirm')
  @Roles(Role.STUDENT)
  @HttpCode(200)
  async confirm(@Body() dto: ConfirmPaymentDto, @Request() req: any) {
    const studentProfileId = req.user.studentProfile?.id;

    if (!studentProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'No student profile found',
      });
    }

    return this.paymentsService.confirmPayment(
      dto.enrollmentId,
      studentProfileId,
    );
  }
}
