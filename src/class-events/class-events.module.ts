import { Module } from '@nestjs/common';
import { ClassEventsController } from './class-events.controller';
import { ClassEventsService } from './class-events.service';

@Module({
  controllers: [ClassEventsController],
  providers: [ClassEventsService],
})
export class ClassEventsModule {}
