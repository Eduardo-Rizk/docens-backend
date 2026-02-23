import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const testStudentEmail = `test-student-${Date.now()}@example.com`;
  const testTeacherEmail = `test-teacher-${Date.now()}@example.com`;
  let studentToken: string;
  let teacherToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('registers a student and returns token + profile', async () => {
      // TODO: requires real Supabase + DB — set SUPABASE_* vars in .env.test
      // For now, test is pending until integration environment is ready
    });

    it('registers a teacher with subjectIds and returns token + teacherProfile', async () => {
      // TODO
    });

    it('returns 400 when teacher omits subjectIds', async () => {
      // TODO
    });

    it('returns 409 when email is already registered', async () => {
      // TODO
    });
  });

  describe('POST /auth/login', () => {
    it('returns token + user + profile for valid credentials', async () => {
      // TODO
    });

    it('returns 401 for wrong password', async () => {
      // TODO
    });
  });

  describe('GET /auth/me', () => {
    it('returns authenticated user profile with valid token', async () => {
      // TODO
    });

    it('returns 401 without token', async () => {
      // TODO
    });

    it('returns 401 with malformed token', async () => {
      // TODO
    });
  });

  describe('RBAC (AUTH-04, AUTH-05)', () => {
    it('returns 401 on protected endpoint without token', async () => {
      // This test does NOT need DB — no @Public() on /auth/me = should 401
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('camelCase responses (INFRA-03)', () => {
    it('response keys are camelCase (not snake_case)', async () => {
      // TODO: after registration works, verify response has camelCase keys
    });
  });
});
