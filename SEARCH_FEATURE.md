# Advanced Search Feature — Design & Implementation Guide

---

## 1. What This Feature Does

The Advanced Search lets any logged-in user query posts with:

| Capability | Example |
|---|---|
| **Keyword search** | find posts whose title or content contains "javascript" |
| **Type filter** | show only `HELP`, `RESOURCE`, or `MEME` posts |
| **Sort** | sort by newest, oldest, or most-reacted |
| **Pagination** | load results page-by-page (e.g. 10 per page) |

---

## 2. How It Fits Into Your Current Codebase

### 2.1 Database (`backend/auth/prisma/schema.prisma`)

Your `Post` model already has everything needed:

```
Post {
  id         Int        — unique identifier
  userId     Int        — who posted
  type       PostType   — HELP | RESOURCE | MEME   ← filter target
  status     PostStatus — PENDING | APPROVED
  title      String     ← keyword search target
  content    String     ← keyword search target
  createdAt  DateTime   ← sort target
  likes      Like[]     ← reaction count for sort-by-popularity
}
```

No Prisma schema change is needed.
The Prisma `findMany` supports `where`, `orderBy`, `skip`, and `take` natively — that is everything pagination + sorting needs.

---

### 2.2 Backend (`backend/auth/src/posts/`)

The current `GET /posts` endpoint in `posts.controller.ts` calls `postsService.getAllPosts(userId)` — it has **no query parameters** at all.

You need a **new endpoint**: `GET /posts/search` with query params:

```
GET /posts/search?q=react&type=HELP&sortBy=createdAt&order=desc&page=1&limit=10
```

#### Flow inside the backend:

```
HTTP Request
    │
    ▼
PostsController.search(query params)
    │
    ▼
PostsService.searchPosts({ q, type, sortBy, order, page, limit, userId })
    │
    ▼
PrismaService.post.findMany({
    where: {
        status: 'APPROVED',               ← only approved posts visible
        type: type ?? undefined,          ← optional PostType filter
        OR: [
            { title:   { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
        ]
    },
    include: { user: { select: { profile: true } } },
    orderBy: sortBy === 'reactions'
        ? { likes: { _count: 'desc' } }
        : { createdAt: order },
    skip: (page - 1) * limit,
    take: limit,
})
    │
    ▼
Returns: { data: Post[], total: number, page: number, limit: number, totalPages: number }
```

**Why a separate endpoint instead of modifying `GET /posts`?**
The existing feed endpoint loads the owner's own PENDING posts too and has a different purpose. A clean `/posts/search` endpoint is easier to maintain and test independently.

---

### 2.3 nginx (`backend/nginx/nginx.conf`)

The current nginx config already forwards `/posts/` → `auth_service:3000/posts/`,
and `/api/` → `auth_service:3000/`. The new route `/posts/search` will be caught
automatically by the existing `/posts/` location block — **no nginx change needed**.

---

### 2.4 Frontend (`frontend/src/`)

#### New files to create:
```
frontend/src/components/Search/
    SearchPage.tsx       ← main page component
    SearchPage.css       ← styles
    SearchBar.tsx        ← controlled input with debounce
    SearchFilters.tsx    ← type dropdown + sort dropdown
    SearchResults.tsx    ← list of PostCards with pagination
frontend/src/services/
    searchApi.ts         ← fetch wrapper for GET /posts/search
```

#### New route in `App.tsx`:
```tsx
<Route path="/search" element={
  <ProtectedLayout>
    <SearchPage />
  </ProtectedLayout>
} />
```

#### New link in `Navbar`:
Add a 🔍 Search link pointing to `/search` alongside the existing navigation links.

---

### 2.5 Data Flow (End to End)

```
User types in SearchBar
    │  (debounce 400ms)
    ▼
searchApi.search({ q, type, sortBy, order, page, limit })
    │
    ▼
fetch(`${API_BASE_URL}/posts/search?q=...&type=...&page=...`)
    with Authorization: Bearer <token>
    │
    ▼
nginx /posts/ → auth_service:3000/posts/search
    │
    ▼
PostsController.search() → PostsService.searchPosts()
    │
    ▼
PrismaService.post.findMany() with where + orderBy + skip + take
    │
    ▼
Returns JSON: { data: [...], total: 42, page: 1, limit: 10, totalPages: 5 }
    │
    ▼
SearchPage state updated → SearchResults renders PostCards
                         → Pagination bar renders page numbers
```

---

## 3. Pagination Strategy

Use **offset-based pagination** (simplest, works great for this scale):

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | current page (1-indexed) |
| `limit` | number | 10 | results per page |
| `skip` = `(page-1) * limit` | computed | — | passed to Prisma |

The backend returns `{ data, total, page, limit, totalPages }` so the frontend can render "Page 2 of 5" and prev/next buttons.

---

## 4. Sorting Options

| `sortBy` value | Prisma `orderBy` |
|---|---|
| `createdAt` (default) | `{ createdAt: order }` where `order` = `asc`/`desc` |
| `reactions` | `{ likes: { _count: 'desc' } }` — posts with most reactions first |

---

## 5. Filter Options

| Param | Values | Maps to Prisma |
|---|---|---|
| `type` | `HELP`, `RESOURCE`, `MEME`, (empty = all) | `where.type` |
| `q` | any string | `where.OR [title/content contains]` |

---

## 6. Files to Create / Files to Touch

### New files (backend)
| File | What goes in it |
|---|---|
| `backend/auth/src/posts/dto/search-posts.dto.ts` | DTO with `q?`, `type?`, `sortBy?`, `order?`, `page?`, `limit?` and class-validator decorators |

### Files to edit (backend)
| File | Change |
|---|---|
| `backend/auth/src/posts/posts.controller.ts` | Add `@Get('search')` method with `@Query()` |
| `backend/auth/src/posts/posts.service.ts` | Add `searchPosts()` method using Prisma findMany + count |

### New files (frontend)
| File | Purpose |
|---|---|
| `frontend/src/services/searchApi.ts` | API client class |
| `frontend/src/components/Search/SearchPage.tsx` | Page component |
| `frontend/src/components/Search/SearchPage.css` | Styles |
| `frontend/src/components/Search/SearchBar.tsx` | Debounced input |
| `frontend/src/components/Search/SearchFilters.tsx` | Type dropdown + sort dropdown |
| `frontend/src/components/Search/Pagination.tsx` | Pagination bar |

### Files to edit (frontend)
| File | Change |
|---|---|
| `frontend/src/App.tsx` | Add `/search` Route |
| `frontend/src/components/Navbar/Navbar.tsx` | Add search link |

---

## 7. Important Notes for Your Project

1. **Auth guard** — The search endpoint must be protected with `@UseGuards(AuthGuard)` because your entire posts system is auth-gated.

2. **Status filter** — Always add `status: 'APPROVED'` to the where clause in search. Regular users should never see PENDING posts from others.

3. **API base URL pattern** — Your frontend uses `import.meta.env.VITE_API_URL || window.location.origin`. Follow the same pattern in `searchApi.ts`.

4. **Existing transformPost()** — Reuse the `transformPost()` private method already in `postsApi.ts` to convert backend posts to frontend Post objects in the search API client too. Or move it to a shared util.

5. **nginx route** — `GET /posts/search` is handled by the existing `/posts/` location block. No nginx change needed.

6. **The `/api/` prefix** — Your `authApi.ts` uses `/api/auth/...` and `/api/profiles/...`. Your `postsApi.ts` uses `/posts/...` (no `/api/` prefix). Follow the **same no-prefix pattern** for the search endpoint: `/posts/search`.

---

## 8. Copilot Prompt

> Copy everything below this line and give it to Copilot:

---

```
I am working on a NestJS + Prisma + PostgreSQL backend and a React + TypeScript + Vite frontend project.

Here is the current state of the relevant code:

── PRISMA SCHEMA (relevant models) ──
model Post {
  id         Int        @id @default(autoincrement())
  userId     Int
  user       User       @relation(fields: [userId], references: [id])
  type       PostType                          // enum: HELP | RESOURCE | MEME
  status     PostStatus @default(PENDING)      // enum: PENDING | APPROVED
  title      String
  content    String
  contentUrl String?
  imageUrl   String?
  createdAt  DateTime   @default(now())
  likes      Like[]
  comments   Comment[]
}

model Profile {
  userId    Int     @id
  username  String  @unique
  avatarUrl String?
  bio       String?
  skills    String[]
}

── EXISTING BACKEND PATTERN ──
- Framework: NestJS, ORM: Prisma, DB: PostgreSQL
- All posts routes are under @Controller('posts') with @UseGuards(AuthGuard)
- AuthGuard reads JWT from Authorization header, sets req.user = { id, email, role, username }
- Posts service uses: this.prisma.post.findMany({ where, include, orderBy })
- include for posts: { user: { select: { id, email, profile: { select: { username, avatarUrl } } } } }
- All search endpoints must add: where.status = 'APPROVED' (users can't see others' pending posts)

── EXISTING FRONTEND PATTERN ──
- Framework: React + TypeScript + Vite
- API base: const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin
- All API calls use: fetch(`${API_BASE_URL}/posts/search`, { headers: { Authorization: `Bearer ${token}` } })
  where token = authAPI.getToken()
- Backend posts come as { id: number, title, content, type, createdAt, user: { profile: { username, avatarUrl } } }
- Frontend Post type: { id: string, title, author: { name, handle, avatar }, timeAgo, content, type, likes, comments, imageUrl }
- The transformPost() function in postsApi.ts converts backend format to frontend format
- Existing PostCard component accepts: { post: Post, onComment, onShare, onShowMore, commentCount }
- Existing styles use dark theme CSS with classes like .feed-container, .filter-tabs-container, .filter-tab.active

── TASK ──
Implement Advanced Search with filters, sorting, and pagination. Create all required files completely.

1. BACKEND — create file: backend/auth/src/posts/dto/search-posts.dto.ts
   - Fields: q (optional string), type (optional: 'HELP'|'RESOURCE'|'MEME'), sortBy (optional: 'createdAt'|'reactions', default 'createdAt'), order (optional: 'asc'|'desc', default 'desc'), page (optional number, default 1), limit (optional number, default 10)
   - Use class-validator: @IsOptional(), @IsString(), @IsEnum(), @IsIn(), @IsNumber(), @Min()
   - Use class-transformer: @Type(() => Number) for page and limit

2. BACKEND — edit file: backend/auth/src/posts/posts.service.ts
   - Add method: async searchPosts(params: SearchPostsDto, userId?: number)
   - Build Prisma where clause: always include status: 'APPROVED', optionally type, optionally OR[{title contains q},{content contains q}] with mode: 'insensitive'
   - For sortBy='reactions': orderBy = { likes: { _count: 'desc' } }
   - For sortBy='createdAt': orderBy = { createdAt: order }
   - Use prisma.$transaction([findMany, count]) to get data + total in one round trip
   - Return: { data: Post[], total, page, limit, totalPages: Math.ceil(total/limit) }

3. BACKEND — edit file: backend/auth/src/posts/posts.controller.ts
   - Add route: @Get('search') BEFORE @Get(':id') if any (to avoid param conflict)
   - Method: search(@Query() dto: SearchPostsDto, @Req() req)
   - Extract userId from req.user.id
   - Call postsService.searchPosts(dto, userId)
   - Decorate with @UseGuards(AuthGuard)

4. FRONTEND — create file: frontend/src/services/searchApi.ts
   - Class SearchAPI with method: search({ q, type, sortBy, order, page, limit })
   - Build URLSearchParams from params (skip empty values)
   - fetch GET ${API_BASE_URL}/posts/search?${params} with Authorization header
   - Transform backend posts to frontend Post format (same logic as transformPost in postsApi.ts — copy/reuse)
   - Return: { data: Post[], total: number, page: number, limit: number, totalPages: number }
   - Export: export const searchAPI = new SearchAPI()

5. FRONTEND — create file: frontend/src/components/Search/SearchBar.tsx
   - Controlled input (value + onChange props)
   - Debounce: call onSearch after 400ms of no typing (use useRef for debounce timer)
   - Show a 🔍 icon inside the input
   - Props: { value: string, onChange: (v: string) => void, onSearch: (v: string) => void, placeholder?: string }

6. FRONTEND — create file: frontend/src/components/Search/SearchFilters.tsx
   - Two dropdowns:
     a) Type filter: All Types | HELP | RESOURCE | MEME
     b) Sort by: Newest | Oldest | Most Reacted
   - Props: { type: string, sortBy: string, order: string, onChange: (filters) => void }

7. FRONTEND — create file: frontend/src/components/Search/Pagination.tsx
   - Shows: Previous button, page numbers (show 5 around current), Next button
   - Props: { page: number, totalPages: number, onPageChange: (p: number) => void }
   - Disable Previous on page 1, disable Next on last page

8. FRONTEND — create file: frontend/src/components/Search/SearchPage.tsx
   - State: query, type, sortBy, order, page, results (Post[]), total, totalPages, loading, error
   - On mount and on any filter/query change: reset page to 1 and call searchAPI.search()
   - On page change: call searchAPI.search() with new page without resetting
   - Render: SearchBar + SearchFilters + "X results found" count + list of PostCard components + Pagination
   - Show loading spinner while fetching, show "No results found for ..." when empty
   - Use same dark theme style as FeedPage: background #0f1117, card background #1a1d2e, purple accent #7c3aed
   - Reuse existing PostCard component for each result

9. FRONTEND — create file: frontend/src/components/Search/SearchPage.css
   - Dark theme matching the app: background #0f1117, cards #1a1d2e, accent purple #7c3aed
   - Responsive: single column on mobile, centered max-width 800px container on desktop
   - Style the search bar with rounded corners anda glow effect on focus
   - Style dropdowns consistently with the rest of the app
   - Style pagination: circular buttons, active page highlighted in purple

10. FRONTEND — edit file: frontend/src/App.tsx
    - Import SearchPage
    - Add inside ProtectedLayout routes: <Route path="/search" element={<ProtectedLayout><SearchPage /></ProtectedLayout>} />

11. FRONTEND — edit file: frontend/src/components/Navbar/Navbar.tsx
    - Add a Search navigation link (🔍 Search) pointing to /search alongside existing nav links

Important rules:
- Follow the exact same code style already in the project
- Do not change the Prisma schema
- Do not change nginx.conf
- The search endpoint URL must be /posts/search (no /api/ prefix, consistent with other post endpoints)
- Always pass Authorization: Bearer <token> header (use authAPI.getToken())
- Keep all existing functionality intact — only ADD new files and ADD to existing files
```
