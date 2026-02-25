import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { InstitutionsService } from './institutions.service';
import { ListInstitutionsDto } from './dto/list-institutions.dto';

@Public()
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  findAll(@Query() query: ListInstitutionsDto) {
    return this.institutionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }

  @Get(':id/subjects')
  findSubjects(@Param('id') id: string) {
    return this.institutionsService.findSubjects(id);
  }
}
