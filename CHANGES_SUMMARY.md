# Comments & Reactions — Backend Implementation Summary
auth_service:3000/
## Service: `backend/core/`

All code lives inside `backend/core/src/`. No existing files were modified except `app.module.ts`.

---

## Files Created

### Prisma Setup
- `prisma/schema.prisma` — Copy of auth schema (Comment + Like models already existed)
- `src/prisma/prisma.service.ts` — PrismaClient wrapper (extends PrismaClient, connects/disconnects on module lifecycle)
- `src/prisma/prisma.module.ts` — Exports PrismaService for injection

### Auth Utilities
- `src/common/guards/auth.guard.ts` — Reads `x-user-id` header, sets `request.user`, throws 401 if missing
- `src/common/decorators/current-user.decorator.ts` — `@CurrentUser()` param decorator extracts user from request

### Comments Module
- `src/comments/comments.module.ts` — Imports PrismaModule, registers controller + service
- `src/comments/comments.controller.ts` — Routes:
  - `GET /comments/post/:postId` — List all comments for a post (public)
  - `GET /comments/post/:postId/count` — Comment count for a post (public)
  - `POST /comments` — Create comment (auth required)
  - `PUT /comments/update` — Update comment (auth + ownership check → 403)
  - `DELETE /comments/:id` — Delete comment (auth + ownership check → 403)
- `src/comments/comments.service.ts` — CRUD logic with ownership validation (ForbiddenException)
- `src/comments/dto/create-comment.dto.ts` — `{ postId: number, content: string }`
- `src/comments/dto/update-comment.dto.ts` — `{ commentId: number, content: string }`

### Reactions Module
- `src/reactions/reactions.module.ts` — Imports PrismaModule, registers controller + service
- `src/reactions/reactions.controller.ts` — Routes:
  - `POST /reactions/toggle` — Toggle a reaction (auth required)
  - `GET /reactions/post/:postId/count` — Reaction counts grouped by type (public)
- `src/reactions/reactions.service.ts` — Toggle logic:
  - Same type twice → **removes** the reaction
  - Different type → **updates** to new type
  - No existing → **creates** new reaction
  - Count endpoint returns `{ postId, total, counts: { LIKE: n, LOVE: n, ... } }`
- `src/reactions/dto/toggle-reaction.dto.ts` — `{ postId: number, type: ReactionType }`

---

## Only Modified File

- `src/app.module.ts` — Added imports for `PrismaModule`, `CommentsModule`, `ReactionsModule`, and a global `ValidationPipe`

---

## Database

- Copied existing migrations from `backend/auth/prisma/migrations/` to `backend/core/prisma/migrations/`
- Applied migrations with `prisma migrate deploy` — tables `comments` and `likes` confirmed in PostgreSQL

---

## Dependencies Added (`package.json`)

- `@prisma/client` — Prisma ORM client
- `class-validator` — DTO validation decorators
- `class-transformer` — DTO transformation
- `prisma` (devDependency) — Prisma CLI

---

## Test Results (all verified via curl)

| # | Endpoint | Test | Result |
|---|----------|------|--------|
| 1 | `POST /comments` | No auth header | **401 Unauthorized** |
| 2 | `POST /comments` | With `x-user-id: 1` | **201 Created** |
| 3 | `GET /comments/post/1` | List comments | **Returns array** |
| 4 | `PUT /comments/update` | Owner updates | **200 Updated** |
| 5 | `PUT /comments/update` | Non-owner updates | **403 Forbidden** |
| 6 | `DELETE /comments/1` | Non-owner deletes | **403 Forbidden** |
| 7 | `GET /comments/post/1/count` | Count | **Returns number** |
| 8 | `POST /reactions/toggle` | No auth header | **401 Unauthorized** |
| 9 | `POST /reactions/toggle` | First LIKE | **action: "created"** |
| 10 | `POST /reactions/toggle` | Same LIKE again | **action: "removed"** |
| 11 | `POST /reactions/toggle` | LIKE then LOVE | **action: "updated"** |
| 12 | `GET /reactions/post/1/count` | Grouped counts | `{ total: 2, counts: { LIKE: 1, LOVE: 1 } }` |
| 13 | `DELETE /comments/1` | Owner deletes | **200 Deleted** |
