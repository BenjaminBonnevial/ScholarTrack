# ScholarTrack

Academic management system — NestJS API + React frontend to manage courses, weighted grades, attendance tracking, and semester reporting.

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11, Prisma 7, PostgreSQL 17 |
| Auth | Better Auth (cookie sessions, roles: STUDENT / TEACHER / ADMIN) |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Tests | Jest 30, coverage > 80% |
| Infra | Docker Compose |

## Prerequisites

- Node.js 22+
- Docker and Docker Compose
- npm

## Environment variables

Copy `.env.example` to `.env` at the root and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL URL, e.g. `postgresql://postgres:postgres@localhost:5432/scholartrack` |
| `BETTER_AUTH_SECRET` | Secret key 32+ chars — `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | API base URL, e.g. `http://localhost:3000` |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated trusted frontend origins, e.g. `http://localhost:8080` |
| `RATE_LIMIT_MAX_REQUESTS` | (optional) Max requests per window (default: 100) |
| `RATE_LIMIT_WINDOW_MS` | (optional) Window duration in ms (default: 60 000) |

## Running with Docker

```bash
docker compose up --build
```

Exposed services:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`
- Frontend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Local development

**API:**

```bash
cd api
npm install
npx prisma generate
npm run start:dev
```

**Frontend:**

```bash
cd web
npm install
npm run dev
```

## Scripts

```bash
# API
npm run build         # Compile TypeScript
npm run test          # Unit tests
npm run test:cov      # Tests + coverage (80% threshold)
npm run test:e2e      # Integration tests

# Frontend
npm run build         # Production build
npm run dev           # Dev server
```

## Module architecture

```
api/src/
├── auth/          – SessionGuard, RolesGuard, Better Auth handler
├── users/         – User CRUD (ADMIN only)
├── semesters/     – Semester CRUD
├── courses/       – Course CRUD with evaluation weights, teacher ownership
├── enrollments/   – Student enrollment with capacity check
├── grades/        – Grade entry, weighted average, all-or-nothing CSV import
├── attendance/    – Attendance sessions, atRisk calculation (33% threshold)
├── admin/         – Bulk enrollment import, semester export, global stats
├── prisma/        – Shared PrismaService (@Global)
└── common/        – DTOs, pipes (CourseCapacityPipe), middleware (RateLimitMiddleware)
```

## Access control

| Role | Rights |
|---|---|
| ADMIN | Full access — user management, import/export, stats |
| TEACHER | CRUD on own courses, grade and attendance entry for own courses |
| STUDENT | Authentication only (read views via frontend) |

## API Reference

Swagger available at `GET /api-docs` after startup.

Main endpoints:

```
POST   /api/auth/sign-up        Register (Better Auth)
POST   /api/auth/sign-in/email  Login (Better Auth)

GET    /semesters               List semesters
POST   /semesters               Create a semester (ADMIN)

GET    /courses                 List courses
POST   /courses                 Create a course (TEACHER, ADMIN)
PATCH  /courses/:id             Update a course
DELETE /courses/:id             Delete a course

POST   /enrollments             Enroll a student (ADMIN)

POST   /grades                  Record a grade (TEACHER, ADMIN)
PATCH  /grades/:id              Update a grade
POST   /grades/import           All-or-nothing CSV import

POST   /attendance/sessions     Create a session (TEACHER, ADMIN)
POST   /attendance/records      Bulk record attendance

POST   /admin/enrollments/import  Bulk enrollment import (ADMIN)
GET    /admin/reports/semester    Semester results export (ADMIN)
GET    /admin/stats               Global stats (ADMIN)

GET    /users                   List users (ADMIN)
POST   /users                   Create a user (ADMIN)
PATCH  /users/:id/role          Update role (ADMIN)
```

## Tests

```bash
cd api

# Unit tests (middleware, pipe, services)
npm run test

# Coverage — must pass the 80% threshold
npm run test:cov

# Integration tests (rate limit, capacity pipe, full flow)
npm run test:e2e
```

## Deliverables

- Git repository with `feature/` branches and conventional commits
- `.env.example` with no secrets
- Swagger at `/api-docs`
- Admin frontend at `http://localhost:8080`
