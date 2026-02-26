import {
  Controller,
  Get,
  Request,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { TeacherService } from './teacher.service';

@Roles(Role.TEACHER)
@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('class-events')
  findOwnClassEvents(@Request() req: any) {
    const teacherProfileId: string | undefined = req.user.teacherProfile?.id;
    if (!teacherProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'Teacher profile not found for this user',
      });
    }
    return this.teacherService.findOwnClassEvents(teacherProfileId);
  }

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    const teacherProfileId = req.user.teacherProfile?.id;
    if (!teacherProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'Teacher profile not found for this user',
      });
    }
    return this.teacherService.getDashboard(teacherProfileId);
  }

  @Get('class-events/:classEventId/buyers')
  getBuyers(
    @Request() req: any,
    @Param('classEventId') classEventId: string,
  ) {
    const teacherProfileId = req.user.teacherProfile?.id;
    if (!teacherProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'Teacher profile not found for this user',
      });
    }
    return this.teacherService.getBuyers(teacherProfileId, classEventId);
  }
}
