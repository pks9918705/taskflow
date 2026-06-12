import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';
import cookieParser = require('cookie-parser');
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authCookie: string;
  let userId: string;
  let otherAuthCookie: string;
  let createdTaskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(createValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up test data
    await prisma.activityLog.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { in: ['e2e_user1@test.com', 'e2e_user2@test.com'] } } });

    // Signup user 1
    const signupRes = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: 'e2e_user1@test.com', password: 'Password@123' });

    const setCookieHeader = signupRes.headers['set-cookie'];
    authCookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
    userId = signupRes.body.data.user.id;

    // Signup user 2
    const signup2Res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: 'e2e_user2@test.com', password: 'Password@123' });

    const setCookieHeader2 = signup2Res.headers['set-cookie'];
    otherAuthCookie = Array.isArray(setCookieHeader2) ? setCookieHeader2[0] : setCookieHeader2;
  });

  afterAll(async () => {
    await prisma.activityLog.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({ where: { email: { in: ['e2e_user1@test.com', 'e2e_user2@test.com'] } } });
    await app.close();
  });

  describe('POST /api/tasks', () => {
    it('creates a task when authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .set('Cookie', authCookie)
        .send({ title: 'E2E Test Task' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('E2E Test Task');
      expect(res.body.data.userId).toBe(userId);
      createdTaskId = res.body.data.id;
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/tasks')
        .send({ title: 'Unauthorized Task' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    it('returns paginated results with correct meta', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/tasks')
        .set('Cookie', authCookie)
        .query({ page: '1', limit: '5' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(5);
      expect(typeof res.body.meta.total).toBe('number');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('returns 403 when user tries to delete another users task', async () => {
      // Ensure task was created by user 1
      expect(createdTaskId).toBeDefined();

      // Try to delete with user 2's cookie
      const res = await request(app.getHttpServer())
        .delete(`/api/tasks/${createdTaskId}`)
        .set('Cookie', otherAuthCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
