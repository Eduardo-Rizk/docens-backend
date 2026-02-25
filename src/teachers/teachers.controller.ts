import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { TeachersService } from './teachers.service';

@Public()
@Controller('institutions')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get(':id/subjects/:subjectId/teachers')
  findByInstitutionAndSubject(
    @Param('id') institutionId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.teachersService.findByInstitutionAndSubject(
      institutionId,
      subjectId,
    );
  }

  @Get(':id/teachers/:teacherProfileId')
  findOne(
    @Param('id') institutionId: string,
    @Param('teacherProfileId') teacherProfileId: string,
  ) {
    return this.teachersService.findOne(institutionId, teacherProfileId);
  }
}
