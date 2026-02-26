import { Controller, Get, Request, BadRequestException } from '@nestjs/common';
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
}
