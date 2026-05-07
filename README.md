# TaskFlow Pro

TaskFlow Pro is a production-style full-stack team task manager built as a premium SaaS dashboard. It combines secure JWT authentication, role-based project operations, collaborative task workflows, analytics, drag-and-drop Kanban UX, file uploads, and a polished responsive interface inspired by Linear, Trello, Notion, Asana, and modern product teams.

## Overview

This project is designed to feel like a real startup product instead of a basic CRUD assignment.

### Highlights

- JWT access tokens + refresh token cookie flow
- Admin and member role permissions
- Project creation, editing, membership management, and deletion
- Task creation, updates, comments, attachments, and Kanban movement
- Premium dashboard analytics powered by Recharts
- Responsive sidebar SaaS layout with dark/light theme toggle
- Railway-ready monorepo with workspaces
- Seeded demo data for recruiter-friendly walkthroughs

## Tech Stack

### Frontend

- React + Vite
- Tailwind CSS
- shadcn-style UI primitives
- Framer Motion
- React Router DOM
- Axios
- React Hook Form
- Zod
- Recharts
- Lucide React
- Sonner

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT authentication
- bcryptjs
- express-validator
- Multer
- Helmet
- CORS

## Core Features

### Authentication

- Register
- Login
- Logout
- Persistent session bootstrap
- Refresh token rotation
- Protected routes
- First registered user becomes initial admin

### Project Management

- Create, edit, and delete projects
- Assign project status and visual theme
- Add or remove members
- Track project-level analytics

### Task Management

- Create, edit, delete, and assign tasks
- Drag-and-drop Kanban board
- Priority, due date, status, and tags
- Task comments and activity history
- File attachment upload support

### Dashboard & Collaboration

- KPI stat cards
- Productivity charts
- Status and priority distribution
- Recent activity timeline
- Upcoming work and workload view

## Screenshots

Add screenshots after running the app locally or deploying it:

- `Landing page`
- `Login / Register`
- `Dashboard analytics`
- `Projects workspace`
- `Kanban board`
- `Task details modal`

## Folder Structure

```text
.
├── client
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── lib
│   │   ├── pages
│   │   ├── routes
│   │   ├── styles
│   │   └── utils
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── seed
│   ├── services
│   ├── utils
│   └── validations
├── package.json
├── railway.json
└── README.md
```

## Environment Variables

Create these files from the included examples:

- `client/.env` from `client/.env.example`
- `server/.env` from `server/.env.example`

### `server/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_long_random_access_secret
JWT_REFRESH_SECRET=your_long_random_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false
UPLOADS_DIR=uploads
DEMO_ADMIN_EMAIL=admin@taskflow.dev
DEMO_ADMIN_PASSWORD=Admin123!
DEMO_MEMBER_EMAIL=member@taskflow.dev
DEMO_MEMBER_PASSWORD=Member123!
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=TaskFlow Pro
```

## Installation

```bash
npm install
```

## Local Development

1. Add your credentials to `server/.env` and `client/.env`.
2. Seed demo data:

```bash
npm run seed
```

3. Start client + server together:

```bash
npm run dev
```

### Individual Commands

```bash
npm run dev:client
npm run dev:server
npm run build
npm start
```

## Demo Credentials

These are also configurable through `server/.env`:

- Admin: `admin@taskflow.dev` / `Admin123!`
- Member: `member@taskflow.dev` / `Member123!`

## REST API

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/refresh`
- `GET /api/auth/me`

### Dashboard

- `GET /api/dashboard/overview`

### Projects

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks

- `GET /api/tasks`
- `GET /api/tasks/board`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/comments`
- `POST /api/tasks/:id/attachments`

### Users

- `GET /api/users/team`

## Validation & Security

- Password hashing with `bcryptjs`
- JWT access tokens
- Refresh token cookie rotation
- Role-based access middleware
- express-validator request validation
- Request sanitization middleware
- Helmet headers
- CORS with credentials
- Static uploads served from the API host

## Deployment Guide

### Railway

This repo is prepared as a single Railway service:

1. Push the project to GitHub.
2. Create a new Railway project from the repo.
3. Railway will detect `railway.json`.
4. Add environment variables from `server/.env`.
5. For production, use:

```env
NODE_ENV=production
CLIENT_URL=https://your-railway-domain.up.railway.app
COOKIE_SECURE=true
```

6. Build the frontend API target against the same origin:

```env
VITE_API_URL=/api
```

7. Run `npm run seed` once if you want demo data in production.

### How production serving works

- `npm run build` creates the Vite bundle
- Express serves `client/dist` in production
- API routes continue to live under `/api`

## Railway Environment Checklist

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CLIENT_URL`
- `NODE_ENV=production`
- `COOKIE_SECURE=true`

## Verification

Verified during generation:

- `npm install`
- `npm run build`
- backend syntax check across all `server/**/*.js`

Notes:

- The frontend production build passes successfully.
- The build currently emits a chunk-size warning because the dashboard bundle is large; this is not a compile failure.
- `npm audit` still reports 2 moderate vulnerabilities in the dependency tree. Review before production launch.
- The API was not fully booted here because it still needs your MongoDB credentials in `server/.env`.

## Future Improvements

- Add Socket.IO real-time updates
- Add email invitations and notifications
- Add pagination for large workspaces
- Add automated tests with Vitest and Supertest
- Add image optimization and signed cloud storage uploads
- Split large dashboard chunks with custom manual chunking

## Recruiter Notes

This project demonstrates:

- Full-stack architecture
- Auth and RBAC
- Modern dashboard UX
- Production-style folder organization
- State management and API abstraction
- Deployment readiness
