import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
} from '@nestjs/common';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @HttpCode(201)
  async create(@Body() dto: CreateEnrollmentDto, @Request() req: any) {
    const studentProfileId = req.user.studentProfile?.id;

    if (!studentProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'No student profile found',
      });
    }

    return this.enrollmentsService.create(studentProfileId, dto);
  }

  @Get(':id')
  @Roles(Role.STUDENT)
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Request() req: any,
  ) {
    const studentProfileId = req.user.studentProfile?.id;

    if (!studentProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'No student profile found',
      });
    }

    return this.enrollmentsService.findOne(id, studentProfileId);
  }
}
