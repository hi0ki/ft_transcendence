*This project has been created as part of the 42 curriculum by eel-ansa, ykamboua, felhafid, hanebaro, mjadid.*

# Peer Hub — ft_transcendence

A real-time social platform built as a microservices architecture where peers can share knowledge, ask for help, and communicate through an interactive feed and live chat system.

---

## Table of Contents

- [Description](#description)
- [Team Information](#team-information)
- [Project Management](#project-management)
- [Technical Stack](#technical-stack)
- [Database Schema](#database-schema)
- [Features List](#features-list)
- [Modules](#modules)
- [Instructions](#instructions)
- [Individual Contributions](#individual-contributions)
- [Resources](#resources)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Description

**Peer Hub**  is a full-stack social web application developed for the **ft_transcendence** project at 42. It provides students with a collaborative platform featuring:

- **Social Feed** — Create, browse, and interact with posts categorized as Help, Resource, or Meme
- **Real-time Chat** — One-on-one messaging with WebSocket support, file sharing (images, videos, voice, documents), message editing/deletion, and online presence tracking
- **User Profiles** — Customizable profiles with bio, skills, avatars, and post history
- **42 OAuth Authentication** — Single Sign-On via 42's OAuth2 alongside traditional email/password registration
- **Friend System** — Send, accept, reject friend requests with real-time status tracking
- **Reactions & Comments** — Rich reactions (Like, Love, Haha, Wow, Sad, Angry) and full comment CRUD on posts
- **Search** — Advanced post search with filters (type, sort, pagination) and user search
- **Admin Moderation Panel** — Post approval workflow, user management, role assignment
- **Achievements & Gamification** — Unlock badges for posting, reacting, and commenting milestones
- **Security** — JWT authentication, rate limiting, XSS sanitization, input validation, Helmet headers, image magic-byte validation

The application runs entirely via **Docker Compose** with six containerized services communicating over an internal bridge network, fronted by an Nginx reverse proxy with SSL termination.

---

## Team Information

| Member | Login | Role | Responsibilities |
|--------|-------|------|-----------------|
| **eel-ansa** | `eel-ansa` | Tech Lead | Architecture design, microservices setup, Docker/Nginx configuration, code reviews, backend infrastructure, security implementation |
| **mjadid** | `mjadid` | Product Owner (PO) | Product vision, feature prioritization,  acceptance criteria, frontend features |
| **hanebaro** | `hanebaro` | Project Manager (PM) | Sprint planning, task tracking, meeting coordination, timeline management, documentation, team communication |
| **felhafid** | `felhafid` | Developer | Feature development, backend endpoint implementation, frontend components, testing, bug fixes |
| **ykamboua** | `ykamboua` | Developer | Feature development, database schema design, frontend components, integration testing, bug fixes |

---

## Project Management

### Work Organization
- **Agile/Scrum methodology** with weekly sprints
- Tasks broken down into features and distributed based on team member strengths
- Code reviews required before merging into the main branch
- Regular stand-up meetings to track progress and blockers

### Tools Used
- **Git/GitHub** — Version control, branching strategy, pull requests
- **GitHub Issues** — Task tracking, bug reports, feature requests
- **Discord** — Primary communication channel for daily coordination, screen sharing, and pair programming

### Communication
- Daily check-ins on Discord
- Weekly sprint review and planning sessions
- Ad-hoc voice calls for debugging and design discussions

---

## Technical Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2 | UI library — component-based architecture |
| **TypeScript** | 5.9 | Type safety across the entire frontend |
| **Vite** | 7.2 | Build tool & dev server with HMR |
| **React Router** | 6.22 | Client-side routing with protected routes |
| **Socket.IO Client** | 4.8 | WebSocket connection for real-time chat |
| **CSS** | — | Custom styling (no CSS framework — hand-crafted dark theme) |

**Justification:** React was chosen for its component reusability and ecosystem maturity. Vite provides significantly faster build times than Webpack. TypeScript catches bugs at compile-time. No CSS framework was used to maintain full control over the UI design.

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **NestJS** | 10.x | Modular MVC framework for all backend services |
| **Prisma ORM** | 6.19 | Type-safe database access and migrations |
| **Passport.js** | 0.7 | Authentication strategies (JWT + 42 OAuth) |
| **Socket.IO** | 4.8 | WebSocket server for real-time chat |
| **Multer** | — | File upload handling (images, videos, audio, documents) |
| **class-validator** | 0.14 | DTO validation with decorators |
| **bcrypt** | 6.0 | Password hashing |

**Justification:** NestJS was chosen for its modular architecture (perfect for microservices), built-in dependency injection, and TypeScript-first approach. Prisma provides type-safe queries and automatic migrations. Passport handles multiple auth strategies cleanly.

### Database
| Technology | Version | Purpose |
|-----------|---------|---------|
| **PostgreSQL** | 15 (Alpine) | Primary relational database |

**Why PostgreSQL:** Chosen for its reliability, ACID compliance, excellent support for complex queries and relations, native JSON support, and seamless integration with Prisma ORM. The relational model suits the interconnected nature of users, posts, comments, reactions, friendships, and conversations.

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Docker & Docker Compose** | Service orchestration and containerization |
| **Nginx** | Reverse proxy, SSL termination, static file serving |
| **Self-signed SSL** | HTTPS encryption (TLS 1.2/1.3) |

**Justification:** Docker ensures consistent environments across development and production. Nginx handles SSL termination, routing, and static file caching efficiently. The microservice architecture (auth, chat, core) allows independent scaling and separation of concerns.

---

## Database Schema

### Entity Relationship Overview

```
┌──────────┐     1:1     ┌──────────┐
│   User   │────────────▶│ Profile  │
│          │             │          │
│ id       │             │ userId   │
│ email    │             │ username │
│ password │             │ avatarUrl│
│ role     │             │ bio      │
│ createdAt│             │ skills[] │
└──────┬───┘             └──────────┘
       │
       │ 1:N
       ▼
┌──────────┐     1:N     ┌──────────┐
│   Post   │────────────▶│ Comment  │
│          │             │          │
│ id       │             │ id       │
│ userId   │             │ postId   │
│ type     │             │ userId   │
│ status   │             │ content  │
│ title    │             │ createdAt│
│ content  │             └──────────┘
│ imageUrl │
│ contentUrl│    1:N     ┌──────────┐
│ createdAt│────────────▶│   Like   │
└──────────┘             │(Reaction)│
                         │ userId   │
                         │ postId   │
                         │ type     │
                         │ createdAt│
                         └──────────┘

┌──────────────┐   1:N   ┌──────────┐
│ Conversation │────────▶│ Message  │
│              │         │          │
│ id           │         │ id       │
│ user1Id      │         │ convId   │
│ user2Id      │         │ senderId │
│ createdAt    │         │ type     │
│              │         │ content  │
└──────────────┘         │ fileUrl  │
                         │ isRead   │
                         │ deletedFor│
                         │ createdAt│
                         └──────────┘

┌──────────────┐         ┌─────────────────┐
│  Friendship  │         │  Notification   │
│              │         │                 │
│ user1Id (PK) │         │ id              │
│ user2Id (PK) │         │ userId          │
│ requestedBy  │         │ senderId        │
│ status       │         │ postId          │
│ createdAt    │         │ type            │
└──────────────┘         │ isRead          │
                         │ createdAt       │
┌─────────────────┐      └─────────────────┘
│ UserAchievement │
│                 │
│ id              │
│ userId          │
│ type            │
│ unlockedAt      │
└─────────────────┘
```

### Tables & Key Fields

| Table | Primary Key | Key Fields | Relationships |
|-------|-----------|------------|---------------|
| **users** | `id` (auto-increment) | `email` (unique), `passwordHash`, `oauthProvider`, `oauthId`, `role` (USER/ADMIN), `createdAt` | → Profile, Posts, Comments, Likes, Notifications, Conversations, Messages, Friendships, Achievements |
| **profiles** | `userId` (FK) | `username` (unique, indexed), `avatarUrl`, `bio`, `skills[]` | ← User (1:1) |
| **posts** | `id` (auto-increment) | `userId` (FK, indexed), `type` (HELP/RESOURCE/MEME), `status` (PENDING/APPROVED, indexed), `title`, `content`, `imageUrl`, `contentUrl`, `createdAt` | ← User, → Comments, Likes, Notifications |
| **comments** | `id` (auto-increment) | `postId` (FK, indexed), `userId` (FK, indexed), `content`, `createdAt` | ← Post, ← User |
| **likes** | `(userId, postId)` composite | `type` (LIKE/LOVE/HAHA/WOW/SAD/ANGRY), `createdAt`, `postId` (indexed) | ← User, ← Post |
| **notifications** | `id` (auto-increment) | `userId` (FK, indexed), `senderId` (FK, nullable), `postId` (FK, nullable), `type` (COMMENT/LIKE/MESSAGE/FRIEND_REQUEST/OTHER), `isRead`, `createdAt` | ← User (receiver), ← User (sender), ← Post |
| **conversations** | `id` (auto-increment) | `user1Id` (FK, indexed), `user2Id` (FK, indexed), `createdAt`, unique constraint on `(user1Id, user2Id)` | ← User×2, → Messages |
| **messages** | `id` (auto-increment) | `conversationId` (FK, indexed), `senderId` (FK, indexed), `type` (TEXT/IMAGE/VIDEO/FILE/VOICE/AUDIO/OTHER), `content`, `fileUrl`, `isRead`, `deletedFor[]`, `createdAt` | ← Conversation, ← User |
| **friendships** | `(user1Id, user2Id)` composite | `requestedBy`, `status` (PENDING/ACCEPTED/BLOCKED), `createdAt` | ← User×2 |
| **user_achievements** | `id` (auto-increment) | `userId` (FK, indexed), `type` (FIRST_POSTER/REACTION_MASTER/COMMENT_KING), `unlockedAt`, unique constraint on `(userId, type)` | ← User |

### Enums

| Enum | Values |
|------|--------|
| `UserRole` | USER, ADMIN |
| `PostType` | HELP, RESOURCE, MEME |
| `PostStatus` | PENDING, APPROVED |
| `ReactionType` | LIKE, LOVE, HAHA, WOW, SAD, ANGRY |
| `MessageType` | TEXT, IMAGE, VIDEO, FILE, VOICE, AUDIO, OTHER |
| `NotificationType` | COMMENT, LIKE, MESSAGE, FRIEND_REQUEST, OTHER |
| `FriendshipStatus` | PENDING, ACCEPTED, BLOCKED |
| `AchievementType` | FIRST_POSTER, REACTION_MASTER, COMMENT_KING |

---

## Features List

| # | Feature | Description | Team Member(s) |
|---|---------|-------------|----------------|
| 1 | **User Registration** | Email/password sign-up with username, hashed passwords (bcrypt) | felhafid |
| 2 | **42 OAuth Login** | Single Sign-On via 42's OAuth2 API (passport-42) | felhafid |
| 3 | **JWT Authentication** | Token-based auth with refresh endpoint, protected routes | felhafid |
| 4 | **Social Feed** | Browse posts (HELP/RESOURCE/MEME) with filter tabs, create new posts with image upload | ykamboua |
| 5 | **Post CRUD** | Create, read, update, delete posts with file upload validation (magic-byte checks) | hanebaro , ykamboua, eel-ansa |
| 6 | **Post Approval Workflow** | New posts start as PENDING; admins approve them before they appear in the feed | eel-ansa, felhafid |
| 7 | **Rich Reactions** | 6 reaction types (Like, Love, Haha, Wow, Sad, Angry) with toggle behavior and emoji picker | mjadid |
| 8 | **Comments System** | Full CRUD on comments: create, edit, delete with real-time count updates | eel-ansa |
| 9 | **Real-time Chat** | WebSocket-based 1:1 messaging with Socket.IO, online presence, message delivery | hanebaro |
| 10 | **File Sharing in Chat** | Upload and share images, videos, audio, voice messages, documents | ykamboua , hanebaro |
| 11 | **Message Management** | Edit messages, delete for all or delete for me, mark as read | hanebaro |
| 12 | **User Profiles** | Profile pages with bio, skills, avatar, post history, friend count | felhafid , eel-ansa |
| 13 | **Profile Editing** | Update username, bio, skills, avatar via settings page | felhafid |
| 14 | **Friend System** | Send/accept/reject friend requests, unfriend, view mutual friends | felhafid |
| 15 | **Search (Posts)** | Full-text search with type filters, sorting (date/reactions), pagination | mjadid |
| 16 | **Search (Users)** | Search users by username with paginated results | mjadid |
| 17 | **Admin Panel** | Post moderation (approve/reject), user management, role assignment, statistics | felhafid , eel-ansa |
| 18 | **Rate Limiting** | ThrottlerModule: 100 requests/minute per IP to prevent abuse | felhafid, ykamboua |
| 19 | **XSS Protection** | Global XSS sanitization interceptor on all inputs | felhafid, ykamboua, hanebaro |
| 20 | **Achievements** | Gamification badges: First Poster (5 posts), Reaction Master (5 reactions), Comment King (15 comments) | eel-ansa |
| 21 | **Online Presence** | Real-time online/offline status via WebSocket heartbeat (1s interval) | hanebaro |
| 23 | **Post Detail Modal** | Expandable post view with full content, images, and links | ykamboua |
| 24 | **Privacy & Terms Pages** | Legal pages for privacy policy and terms of service | ykamboua |
| 25 | **Responsive Dark UI** | Hand-crafted dark theme with CSS, mobile-responsive layout | ykamboua , hanebaro , eel-ansa , mjadid, felhafid |

---

## Modules

### Module Summary

| # | Module | Type | Points | Team Member(s) |
|---|--------|------|--------|----------------|
| 1 | Use a backend framework (NestJS) | Major | 2 | All members |
| 2 | Standard user management | Major | 2 | felhafid |
| 3 | Remote authentication (42 OAuth) | Major | 2 | felhafid |
| 4 | Backend as microservices | Major | 2 | All members |
| 5 | Allow users to interact with other users | Major | 2 | hanebaro (chat), eel-ansa & felhafid (profile & friends) |
| 6 | Implement real-time features | Major | 2 | hanebaro |
| 7 | Use a frontend framework (React) | Minor | 1 | All members |
| 8 | Use an ORM (Prisma) | Minor | 1 | eel-ansa |
| 9 | Custom-made design system | Minor | 1 | eel-ansa |
| 10 | File upload and management | Minor | 1 | felhafid, ykamboua, hanebaro |
| 11 | Support for additional browsers | Minor | 1 | All members |
| 12 | Advanced permissions system | Minor | 1 | eel-ansa |
| 13 | User activity analytics | Minor | 1 | eel-ansa |
| 14 | Custom Minor Module | Minor | 1 | eel-ansa |
| 15 | Advanced search functionality | Minor | 1 | mjadid |
| | **Total** | **6 Major + 9 Minor** | **21** | |


---

## Instructions

### Prerequisites

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| **Docker** | 20.10+ | Container runtime |
| **Docker Compose** | 2.0+ | Service orchestration |
| **Make** | Any | Build automation |
| **Git** | Any | Version control |

### Environment Configuration

1. **Clone the repository:**
   ```bash
   git clone <repository-url> 
   cd ft_transcendence
   ```

2. **Create the `.env` file** for the auth service:
   ```bash
   cp backend/auth/env.example backend/auth/.env
   ```

3. **Edit `backend/auth/.env`** with your values:
   ```env
   DATABASE_URL="postgresql://database_user:database_password@postgres:5432/database_name"
   JWT_SECRET="your_jwt_secret_key"

   LIENT_ID="Client ID from 42 API"
   CLIENT_SECRET="Client Secret from 42 API"
   CALLBACK_URL="https://localhost/auth/42/callback"

   # Frontend URL (for CORS and redirects)
   FRONTEND_URL=https://localhost
   ```

4. **Create the frontend `.env`** (optional — defaults to `https://localhost`):
   ```bash
   echo "VITE_API_URL=https://localhost" > frontend/.env
   ```

### Build & Run

```bash
# Build all containers and start in detached mode
make

# Or equivalently:
docker compose up --build -d
```

This will start 6 services:

| Service | Internal Port | Description |
|---------|--------------|-------------|
| **frontend** | 5173 | Vite dev server |
| **nginx** | 443 | HTTPS reverse proxy |
| **auth_service** | 3000 | Main REST API |
| **chat_service** | 3000 | WebSocket server |
| **core_service** | 3000 | Additional API layer |
| **postgres** | 5432 | PostgreSQL database |

### Access the Application

Open your browser and navigate to:
```
https://localhost
```

> **Note:** The self-signed SSL certificate will trigger a browser warning. Accept the risk to proceed.

### Useful Commands

```bash
# View running containers
make ps

# View logs (follow mode)
make logs

# Restart all services
make restart

# Stop all services
make down

# Full cleanup (remove containers, images, volumes)
make clean

# Rebuild from scratch
make re
```

### Database Management

The database automatically migrates on startup. For manual Prisma operations:

```bash
# Enter the auth service container
docker exec -it auth_service sh

# Run migrations
npx prisma migrate deploy

# Open Prisma Studio (GUI)
npx prisma studio

# Generate Prisma client
npx prisma generate
```

---

---

## Resources

### Documentation & References

- **NestJS** — [https://docs.nestjs.com/](https://docs.nestjs.com/) — Backend framework documentation
- **React** — [https://react.dev/](https://react.dev/) — Frontend library documentation
- **Prisma** — [https://www.prisma.io/docs](https://www.prisma.io/docs) — ORM documentation and migration guides
- **PostgreSQL** — [https://www.postgresql.org/docs/15/](https://www.postgresql.org/docs/15/) — Database documentation
- **Socket.IO** — [https://socket.io/docs/v4/](https://socket.io/docs/v4/) — WebSocket library documentation
- **Docker Compose** — [https://docs.docker.com/compose/](https://docs.docker.com/compose/) — Container orchestration
- **Passport.js** — [http://www.passportjs.org/](http://www.passportjs.org/) — Authentication middleware
- **42 API** — [https://api.intra.42.fr/apidoc](https://api.intra.42.fr/apidoc) — OAuth integration reference
- **Vite** — [https://vitejs.dev/guide/](https://vitejs.dev/guide/) — Build tool documentation
- **TypeScript** — [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/) — Language reference

### Tutorials & Articles

- NestJS Microservices: [https://docs.nestjs.com/microservices/basics](https://docs.nestjs.com/microservices/basics)
- Prisma with NestJS: [https://docs.nestjs.com/recipes/prisma](https://docs.nestjs.com/recipes/prisma)
- Socket.IO with NestJS: [https://docs.nestjs.com/websockets/gateways](https://docs.nestjs.com/websockets/gateways)
- JWT Authentication: [https://jwt.io/introduction](https://jwt.io/introduction)
- Docker Best Practices: [https://docs.docker.com/develop/develop-images/dockerfile_best-practices/](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

### AI Usage Disclosure

AI tools (GitHub Copilot, Claude) were used during development for the following tasks:

- **Code assistance:** Autocompletion and inline suggestions while writing TypeScript/NestJS boilerplate code
- **Debugging:** Identifying issues with Docker networking, Nginx proxy configuration, and WebSocket handshake problems
- **CSS styling:** Generating initial CSS snippets for the dark theme which were then customized
- **Documentation:** Assisting with README structure and content organization
- **Code review:** Reviewing code patterns and suggesting improvements for security (XSS sanitization, input validation)

All AI-generated code was reviewed, tested, and adapted by team members. The architecture, design decisions, and core logic were developed by the team.

---

## Known Limitations

- SSL uses self-signed certificates (browser warnings expected)
- Chat does not support group conversations (1:1 only)
- No email verification on registration
- No password reset functionality
- Image upload limited to JPG, PNG, GIF (max 5MB for posts, 50MB for chat files)
- No push notifications (in-app only)
- Search uses basic `CONTAINS` matching (no full-text search engine like Elasticsearch)

---

## License

This project was developed as part of the 42 school curriculum. All rights reserved by the authors.
