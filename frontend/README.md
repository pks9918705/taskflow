# TaskFlow — Frontend

## Stack
Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Axios

## Prerequisites
- Node.js 18+
- Backend running on http://localhost:4000

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

## Pages
| Route | Description |
|---|---|
| `/login` | Login page |
| `/signup` | Signup page |
| `/tasks` | Task list with filters, search, sort, pagination |
| `/tasks/new` | Create task |
| `/tasks/[id]` | Task detail with activity log |
| `/tasks/[id]/edit` | Edit task |
| `/admin/tasks` | All tasks (admin only) |
| `/admin/users` | All users (admin only) |

## Architecture
```
pages/app      → hooks only (never services directly)
hooks          → services only (no axios)
services       → lib/api/client only
lib/api/client → axios instance + interceptors
```

## Assumptions
- Auth state persists via httpOnly cookie set by backend
- No token management on frontend
- Admin role assigned manually in DB (no self-signup as admin)
- Middleware reads a `token` cookie for route protection; role decoded from JWT payload
