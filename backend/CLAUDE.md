# Task Management API — Backend

## Role
You are a senior backend engineer. Write clean, maintainable, production-quality
TypeScript code using NestJS. No shortcuts. No hacks.

## Tech Stack
- NestJS (TypeScript)
- PostgreSQL
- Prisma ORM
- JWT auth (httpOnly cookies)
- class-validator + class-transformer
- @nestjs/swagger for API docs
- Jest for testing

## Architecture Rules
- Controller → Service → Repository pattern. Always.
- Controllers handle HTTP only. No business logic in controllers.
- Services handle business logic. No direct Prisma calls in services.
- Repositories handle all database queries. Only place Prisma is called.
- DTOs for every request/response. Validated with class-validator.
- Never expose passwordHash in any response. Ever.
- All errors go through the global HttpException filter.
- All responses go through the global ResponseInterceptor.

## Response Shape
Every API response must follow this shape:

Success:
{
  "success": true,
  "data": {}
}

Paginated:
{
  "success": true,
  "data": [],
  "meta": { "total": 0, "page": 1, "limit": 10, "totalPages": 1 }
}

Error:
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "human readable message",
    "details": {}
  }
}

## Folder Structure
src/
  auth/          → decorators/, dto/, guards/, strategies/
  tasks/         → dto/
  users/
  activity/
  prisma/
  common/        → filters/, interceptors/, pipes/, decorators/
  config/

## Git Rules
- Commit after every completed step
- Commit message format: "step(scope): description"
- Example: "step(prisma): add schema and initial migration"
- Never commit .env files

## Error Handling Rules
- Use NestJS built-in exceptions (NotFoundException, UnauthorizedException etc.)
- Always include meaningful error messages
- Validate all inputs at DTO level
- Ownership checks in service layer, not controller

## Security Rules
- Hash passwords with bcryptjs (salt rounds: 12)
- JWT in httpOnly cookie, not Authorization header
- Validate ownership before every task mutation
- Admin role check via RolesGuard

## Step Completion Checklist
After each step:
1. Code compiles without errors
2. No TypeScript errors
3. Commit the change with proper message
4. Note what was built