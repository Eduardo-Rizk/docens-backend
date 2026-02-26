import {
  BadRequestException,
  Body,
  Controller,
  Put,
  Request,
} from '@nestjs/common';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { TeacherProfileService } from './teacher-profile.service';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';

@Controller('teacher-profile')
@Roles(Role.TEACHER)
export class TeacherProfileController {
  constructor(
    private readonly teacherProfileService: TeacherProfileService,
  ) {}

  @Put()
  async update(
    @Body() dto: UpdateTeacherProfileDto,
    @Request() req: any,
  ) {
    const teacherProfileId = req.user.teacherProfile?.id;

    if (!teacherProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'Teacher profile not found for this user',
      });
    }

    return this.teacherProfileService.update(teacherProfileId, dto);
  }
}
