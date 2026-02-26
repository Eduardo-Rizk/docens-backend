import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassEventsModule } from './class-events/class-events.module';
import { TeacherProfileModule } from './teacher-profile/teacher-profile.module';
import { TeacherModule } from './teacher/teacher.module';
import { StudentProfileModule } from './student-profile/student-profile.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    PrismaModule,
    AuthModule,
    InstitutionsModule,
    SubjectsModule,
    TeachersModule,
    ClassEventsModule,
    TeacherProfileModule,
    TeacherModule,
    StudentProfileModule,
    EnrollmentsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
