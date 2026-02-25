import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ClassEventsService } from './class-events.service';
import { ListClassEventsDto } from './dto/list-class-events.dto';

@Public()
@Controller('class-events')
export class ClassEventsController {
  constructor(private readonly classEventsService: ClassEventsService) {}

  @Get()
  findAll(@Query() query: ListClassEventsDto) {
    return this.classEventsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classEventsService.findOne(id);
  }
}
