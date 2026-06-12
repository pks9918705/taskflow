# TaskFlow — Task Management Application

A full-stack task management app built with **NestJS** (backend), **Next.js** (frontend), and **PostgreSQL** via **Prisma**.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend   | NestJS, TypeScript, Prisma ORM, Swagger |
| Database  | PostgreSQL 15                           |
| Auth      | JWT (HTTP-only cookies)                 |
| Container | Docker, Docker Compose                  |

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL 15 running locally **or** Docker

### 1. Clone the repository

```bash
git clone <repo-url>
cd OnlineAssignment
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskdb
JWT_SECRET=your_local_secret
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Run database migrations and seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

Start the dev server:

```bash
npm run start:dev
```

API runs at `http://localhost:4000/api`  
Swagger docs at `http://localhost:4000/api/docs`

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## Production Setup (Docker Compose)

### Prerequisites

- Docker & Docker Compose

### 1. Clone and configure

```bash
git clone <repo-url>
cd OnlineAssignment
```

> **Important:** Before starting, update the `JWT_SECRET` in `docker-compose.yml` to a strong random value. Do not use the default in production.

### 2. Build and start all services

```bash
docker compose up --build -d
```

This starts three containers:

| Container          | Port  | Description          |
|--------------------|-------|----------------------|
| `taskflow-postgres`| 5432  | PostgreSQL database  |
| `taskflow-api`     | 4000  | NestJS REST API      |
| `taskflow-web`     | 3000  | Next.js frontend     |

Prisma migrations run automatically when the API container starts.

### 3. Verify

```bash
docker compose ps        # all containers should be "Up"
docker compose logs api  # check for migration output
```

- App: `http://localhost:3000`
- API: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api/docs`

### 4. Stop services

```bash
docker compose down          # stop containers
docker compose down -v       # stop and delete database volume
```

---

## Environment Variables Reference

### Backend

| Variable        | Description                          | Default (dev)                                  |
|-----------------|--------------------------------------|------------------------------------------------|
| `DATABASE_URL`  | PostgreSQL connection string         | `postgresql://postgres:postgres@localhost:5432/taskdb` |
| `JWT_SECRET`    | Secret key for signing JWTs          | —                                              |
| `JWT_EXPIRES_IN`| JWT expiry duration                  | `7d`                                           |
| `PORT`          | API server port                      | `4000`                                         |
| `NODE_ENV`      | Environment (`development`/`production`) | `development`                              |
| `FRONTEND_URL`  | Allowed CORS origin                  | `http://localhost:3000`                        |

### Frontend

| Variable               | Description           | Default                        |
|------------------------|-----------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL`  | Backend API base URL  | `http://localhost:4000/api`    |

---

## Running Tests

```bash
# Backend unit tests
cd backend && npm test

# Backend test coverage
cd backend && npm run test:cov

# Frontend lint check
cd frontend && npm run lint
```

CI runs on every push via GitHub Actions (`.github/workflows/`).

---

## Project Structure

```
.
├── backend/              # NestJS API
│   ├── prisma/           # Schema, migrations, seed
│   └── src/
│       ├── auth/         # JWT auth (register, login, logout)
│       ├── tasks/        # Task CRUD with filtering & sorting
│       ├── users/        # User profile
│       ├── admin/        # Admin-only endpoints
│       └── activity/     # Activity log
├── frontend/             # Next.js app
│   └── src/
│       ├── app/          # App router pages
│       ├── components/   # UI components (shadcn/ui)
│       └── lib/          # API client, hooks, stores
├── docker-compose.yml    # Production container orchestration
└── .github/workflows/    # CI pipeline
```
