# Task Management API

A production-quality REST API for task management built with NestJS, PostgreSQL, and Prisma ORM.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20, TypeScript |
| Framework | NestJS 11 |
| Database | PostgreSQL 15 |
| ORM | Prisma 7 |
| Auth | JWT (httpOnly cookies) |
| Validation | class-validator + class-transformer |
| Docs | Swagger / OpenAPI |
| Tests | Jest + Supertest |
| Container | Docker + Docker Compose |

## Prerequisites

- Node.js 20+
- npm 9+
- PostgreSQL 15+ **or** Docker + Docker Compose

## Local Setup (without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate deploy

# 5. Start development server
npm run start:dev
```

## Local Setup (with Docker)

```bash
# Start postgres + api together
docker-compose up --build

# Or in the background
docker-compose up -d --build

# Run migrations inside the api container
docker-compose exec api npx prisma migrate deploy
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/taskdb` |
| `JWT_SECRET` | Secret key for signing JWTs | — (required) |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment (`development`/`production`/`test`) | `development` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |

## API Endpoints

All endpoints are prefixed with `/api`. Swagger UI is available at `http://localhost:4000/api/docs`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | — | Register a new user |
| POST | `/api/auth/login` | — | Login (sets httpOnly cookie) |
| POST | `/api/auth/logout` | — | Logout (clears cookie) |
| GET | `/api/auth/me` | Required | Get current user |

### Tasks

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tasks` | Required | List tasks (paginated, filtered, sorted) |
| POST | `/api/tasks` | Required | Create a task |
| GET | `/api/tasks/:id` | Required | Get task by ID |
| PATCH | `/api/tasks/:id` | Required | Update a task |
| DELETE | `/api/tasks/:id` | Required | Delete a task |
| GET | `/api/tasks/:id/activity` | Required | Get task activity log |

**Query Parameters for GET /api/tasks:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `status` | `PENDING\|IN_PROGRESS\|DONE` | Filter by status |
| `priority` | `LOW\|MEDIUM\|HIGH` | Filter by priority |
| `search` | string | Search by title |
| `sortBy` | `dueDate\|priority\|createdAt` | Sort field (default: createdAt) |
| `sortOrder` | `asc\|desc` | Sort direction (default: desc) |

### Admin (ADMIN role only)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/tasks` | Admin | Get all users' tasks |
| GET | `/api/admin/users` | Admin | Get all users |

## Running Tests

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:cov

# E2E tests (requires running database)
npm run test:e2e
```

## Assumptions & Trade-offs

- **Authentication**: JWT stored in httpOnly cookies rather than Authorization headers to prevent XSS token theft.
- **Ownership**: Task ownership is enforced in the service layer on every mutation. Admins can read all tasks but cannot bypass service-layer ownership for mutations.
- **Activity Logging**: Logs are created after every task mutation (CREATED, UPDATED, DELETED). The UPDATED log includes a field-level diff so consumers can audit exactly what changed.
- **Prisma 7**: This version moved datasource connection URLs from `schema.prisma` to `prisma.config.ts`. The migration SQL is committed for version control but must be applied via `prisma migrate deploy` on a live database.
- **Password strength**: Passwords must contain uppercase, lowercase, digit, and special character — enforced at the DTO level.
- **E2E tests**: Require a real PostgreSQL database (no mock). They clean up after themselves using `beforeAll`/`afterAll` hooks.
