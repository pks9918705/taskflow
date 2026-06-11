# Task Management — Frontend

## Role
You are a senior frontend engineer. Write clean, maintainable, production-quality
TypeScript code using Next.js 14 App Router. Follow every rule below strictly.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui (components in components/ui/)
- React (useState, useEffect, useCallback) — no external state library
- React Hook Form + Zod (forms + validation)
- Axios (HTTP client)
- date-fns (date formatting)

## Architecture Layers (strict — never skip a layer)
- components/ and pages → import from hooks/ only. Never from services/ directly.
- hooks/ → import from services/ only. No axios imports.
- services/ → import from lib/api/client only. Pure async functions, no React.
- lib/api/client.ts → axios instance + interceptors only. No endpoint knowledge.

## State Management
- No external state library (no TanStack Query, no Zustand, no Redux)
- Server data: useState + useEffect inside custom hooks
- Loading state: boolean, always initialise as true for data fetches
- Error state: string | null, always handled in UI
- After every mutation (create/update/delete): call the fetch function again to refresh
- AuthContext is the only React Context in the app

## Hooks Pattern
Every data hook must expose this shape:
{
  data,           // the actual data (typed)
  isLoading,      // boolean
  error,          // string | null
  refetch,        // () => void — call after mutations to refresh
}

Mutation hooks expose:
{
  mutate,         // async function that calls the service
  isLoading,      // boolean
  error,          // string | null
}

## Services Pattern
- All service files in services/
- Named async function exports only. No classes. No default exports.
- auth.service.ts → login, signup, logout, getMe
- tasks.service.ts → getTasks, getTaskById, createTask, updateTask,
                     deleteTask, getTaskActivity

## Component Rules
- Server Components by default. 'use client' only when using hooks or browser APIs.
- Props interface defined above every component
- Loading: skeleton components (not spinners)
- Error: visible error message with retry option where possible
- Empty: meaningful empty state UI, never blank screen

## Naming
- Components: PascalCase
- Hooks: camelCase with 'use' prefix
- Services: camelCase with .service.ts suffix
- Schemas: camelCase with Schema suffix
- Types: PascalCase

## Responsive
- Mobile first. 375px base, scale up.
- Sidebar collapses on mobile.

## Git Rules
- Commit after every completed step
- Format: "step(scope): description"
- Never commit .env.local

## API Response Shape (from NestJS backend)
Success:   { success: true, data: {} }
Paginated: { success: true, data: [], meta: { total, page, limit, totalPages } }
Error:     { success: false, error: { code, message, details? } }

## Backend URL
http://localhost:4000
All routes prefixed with /api
Auth via httpOnly cookie — no token handling on frontend