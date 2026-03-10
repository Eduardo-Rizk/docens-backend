import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SubjectsService } from './subjects.service';

@Public()
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get('by-institution')
  findByInstitution() {
    return this.subjectsService.findByInstitution();
  }
}
