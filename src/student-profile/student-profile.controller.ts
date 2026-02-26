import {
  BadRequestException,
  Body,
  Controller,
  Put,
  Request,
} from '@nestjs/common';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { StudentProfileService } from './student-profile.service';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Controller('student-profile')
export class StudentProfileController {
  constructor(private readonly studentProfileService: StudentProfileService) {}

  @Put()
  @Roles(Role.STUDENT)
  async update(@Body() dto: UpdateStudentProfileDto, @Request() req: any) {
    const studentProfileId = req.user.studentProfile?.id;

    if (!studentProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'No student profile found',
      });
    }

    return this.studentProfileService.update(studentProfileId, dto);
  }
}
