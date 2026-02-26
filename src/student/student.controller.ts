import { BadRequestException, Controller, Get, Request } from '@nestjs/common';
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('agenda')
  @Roles(Role.STUDENT)
  async getAgenda(@Request() req: any) {
    const studentProfileId = req.user.studentProfile?.id;

    if (!studentProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'No student profile found',
      });
    }

    return this.studentService.getAgenda(studentProfileId);
  }
}
