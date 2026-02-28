# Building /users CRUD - Step by Step Guide

## Request Flow Overview
```
Client HTTP Request → Controller → Service → Prisma → Database → Response back to Client
```

## Step 1: Define Schema
- Update `prisma/schema.prisma` with User model fields
- Run `prisma migrate dev` to create migration and sync database

## Step 2: Setup Prisma Service
- Create `src/prisma/prisma.service.ts` - extends PrismaClient, connects to database
- Create `src/prisma/prisma.module.ts` - exports PrismaService so other modules can use it
- This is the database connector layer for the whole auth app

## Step 3: Create Module Structure
- Make `src/users/` folder
- Inside create: `users.service.ts`, `users.controller.ts`
- Create `src/users/dto/` subfolder for data validation classes

## Step 4: Build Service Layer
- Service file: `src/users/users.service.ts`
- Constructor: inject PrismaService
- Methods: `create()`, `findAll()`, `findOne()`, `update()`, `delete()`
- Each method calls Prisma functions to interact with database
- This is your business logic - Prisma handles database operations

## Step 5: Build Controller Layer
- Controller file: `src/users/users.controller.ts`
- Constructor: inject UsersService
- Routes that listen for HTTP requests:
  - `POST /users` + body → calls service.create(body)
  - `GET /users` → calls service.findAll()
  - `GET /users/:id` → calls service.findOne(id)
  - `PUT /users/:id` + body → calls service.update(id, body)
  - `DELETE /users/:id` → calls service.delete(id)
- This is your HTTP API layer - receives requests and returns responses

## Step 6: Create DTOs
- `src/users/dto/create-user.dto.ts` - defines data for POST requests
- `src/users/dto/update-user.dto.ts` - defines data for PUT requests (fields optional)
- DTOs validate and type-check incoming request data
- Ensures client sends correct data format

## Step 7: Wire Everything Together
- Create `src/users/users.module.ts`:
  - Imports: PrismaModule (to use Prisma)
  - Providers: UsersService
  - Controllers: UsersController
- Update `src/app.module.ts`: Import UsersModule
- Now the auth container has complete CRUD endpoints

## Step 8: Test It
- Run: `npm run start:dev`
- Test with curl or Postman:
  - CREATE: `POST http://localhost:3000/users` with `{email, passwordHash}`
  - READ ALL: `GET http://localhost:3000/users`
  - READ ONE: `GET http://localhost:3000/users/1`
  - UPDATE: `PUT http://localhost:3000/users/1` with `{email?, passwordHash?}`
  - DELETE: `DELETE http://localhost:3000/users/1`
- All requests go through auth container → auth service uses Prisma → Prisma talks to database
