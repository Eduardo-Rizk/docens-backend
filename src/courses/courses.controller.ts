import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CoursesService } from './courses.service';

@Public()
@Controller('institutions/:institutionId/courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findCourses(@Param('institutionId') institutionId: string) {
    return this.coursesService.findCourses(institutionId);
  }

  @Get(':courseId/semesters')
  findSemesters(
    @Param('institutionId') institutionId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.coursesService.findSemesters(institutionId, courseId);
  }

  @Get(':courseId/semesters/:yearOrder/subjects')
  findSemesterSubjects(
    @Param('institutionId') institutionId: string,
    @Param('courseId') courseId: string,
    @Param('yearOrder', ParseIntPipe) yearOrder: number,
  ) {
    return this.coursesService.findSemesterSubjects(
      institutionId,
      courseId,
      yearOrder,
    );
  }
}
