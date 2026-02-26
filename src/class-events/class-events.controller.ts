import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { ClassEventsService } from './class-events.service';
import { ListClassEventsDto } from './dto/list-class-events.dto';
import { CreateClassEventDto } from './dto/create-class-event.dto';
import { UpdateClassEventDto } from './dto/update-class-event.dto';

@Controller('class-events')
export class ClassEventsController {
  constructor(private readonly classEventsService: ClassEventsService) {}

  @Public()
  @Get()
  findAll(@Query() query: ListClassEventsDto) {
    return this.classEventsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classEventsService.findOne(id);
  }

  @Roles(Role.TEACHER)
  @Post()
  create(@Body() dto: CreateClassEventDto, @Request() req: any) {
    const teacherProfileId: string | undefined = req.user.teacherProfile?.id;
    if (!teacherProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'Teacher profile not found for this user',
      });
    }
    return this.classEventsService.create(teacherProfileId, dto);
  }

  @Roles(Role.TEACHER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClassEventDto,
    @Request() req: any,
  ) {
    const teacherProfileId: string | undefined = req.user.teacherProfile?.id;
    if (!teacherProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'Teacher profile not found for this user',
      });
    }
    return this.classEventsService.update(id, teacherProfileId, dto);
  }

  @Roles(Role.TEACHER)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const teacherProfileId: string | undefined = req.user.teacherProfile?.id;
    if (!teacherProfileId) {
      throw new BadRequestException({
        error: 'BAD_REQUEST',
        message: 'Teacher profile not found for this user',
      });
    }
    return this.classEventsService.remove(id, teacherProfileId);
  }
}
