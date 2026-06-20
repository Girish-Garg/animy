# AnimY

> Text-to-video generation, organized into chats and albums.

AnimY is a full-stack web app where a user types a prompt and gets back a generated
video. Generations are grouped into **chats** (like a conversation history) and the
videos you want to keep can be saved into **albums**. The app orchestrates an external
video-generation service, tracks each job to completion, and emails you when your
video is ready.

The repository is a monorepo with two independent apps:

| Path        | App                              | Stack                                    |
| ----------- | -------------------------------- | ---------------------------------------- |
| `/` (root)  | Frontend (single-page app)       | React 18, Vite 6, Tailwind v4, Recoil    |
| `/backend`  | REST API + job orchestration     | Express 5, MongoDB/Mongoose, Clerk       |

---

## Features

- **Prompt → video** generation with live status updates (processing / completed / failed / cancelled).
- **Chats**: each generation lives in a chat thread; a rolling limit keeps the most recent chats.
- **Stop generation** mid-flight; status is reconciled from the backend so it never gets "stuck" on reload.
- **Albums**: save finished videos into named albums, rename them, and remove them.
- **Auth** via [Clerk](https://clerk.com) (email/password, OAuth/SSO, password reset).
- **Email notifications** when a video finishes (Zoho SMTP via Nodemailer).
- **Hardened API**: Helmet, CORS allow-list, rate limiting, zod request validation, per-user authorization checks, and structured logging.

---

## Architecture

```
┌────────────┐    JWT (Clerk)     ┌─────────────┐   /video/generate   ┌──────────────────┐
│  Frontend  │ ─────────────────► │   Backend   │ ──────────────────► │  External Video  │
│ (React SPA)│ ◄───────────────── │ (Express 5) │ ◄────────────────── │   Generation API │
└────────────┘   chats / status   └─────────────┘   /video/status     └──────────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  MongoDB    │  Users · Chats · Prompts · Albums
                                   └─────────────┘
```

**Generation flow**

1. The frontend authenticates with Clerk and attaches the session JWT to every API request.
2. The backend verifies the JWT and upserts a local `User` (keyed by Clerk ID).
3. Creating a chat (or generating in an existing one) calls the external Video API's
   `/video/generate`, then stores a `Prompt` with status `processing`.
4. The frontend polls `GET /chat/:chatId/status/:promptId`. The backend answers instantly
   with the current status **and** spins up a background poll loop against the Video API
   (up to 60 attempts × 20s). When the job finishes it updates the `Prompt`
   (`completed` / `failed` / `cancelled`) and sends a success email.
5. Stopping marks the `Prompt` as `cancelled`; the next status check returns immediately.
6. A finished video can be added to an album, which moves the media on the Video API and
   records the new paths on the `Album`.

> **Note:** AnimY does not generate video pixels itself. It orchestrates an external
> video-generation service configured via `Video_API_BASE_URL`.

---

## Project structure

```
animy/
├─ src/                       # Frontend
│  ├─ api/                    # Typed API layer (chats, albums, dashboard, normalize)
│  ├─ components/
│  │  ├─ auth/                # AuthLayout, IconInput
│  │  ├─ common/              # Modal, ConfirmDialog, LoadingState, ErrorState, VideoThumbnail
│  │  ├─ layout/              # CustomTrigger, SidebarHelpCard
│  │  ├─ ui/                  # shadcn/ui primitives (Radix-based)
│  │  ├─ *Overlay.jsx         # Album/video overlays (GSAP-animated)
│  │  ├─ RequireAuth.jsx      # Route guard
│  │  └─ ErrorBoundary.jsx
│  ├─ context/                # VideoGeneration + Throttle React contexts
│  ├─ hooks/                  # useChats, useAlbums, useDashboard, useAuth, useModalA11y, use-mobile
│  ├─ lib/                    # apiClient, tokenBridge, generationStatus, clerkError, config
│  ├─ pages/                  # DashboardPage, ChatSideBar, SideBar, Profile, Billing, auth/*
│  └─ recoil/                 # Recoil atoms
├─ backend/
│  ├─ config/env.js           # Fail-fast env validation (zod)
│  ├─ controllers/            # chat, generate, album, dashboard
│  ├─ db/connection.js        # Mongoose connection
│  ├─ middleware/             # clerkAuth (JWT → local user), validation (zod)
│  ├─ routes/                 # chat, album, dashboard
│  ├─ schema/                 # User, Chat, Prompt, Album, Video (Mongoose)
│  ├─ utils/                  # logger (pino), videoApi (axios+retry), sendSuccessMain, zod.validation
│  └─ index.js                # App entry: Helmet, CORS, rate limit, routes
└─ .github/workflows/ci.yml   # Lint + test + build
```

---

## Getting started

### Prerequisites

- **Node.js ≥ 18**
- A **MongoDB** database (Atlas works out of the box; transactions require a replica set, which Atlas provides)
- A **Clerk** application (for the publishable + secret keys)
- Access to the **external Video Generation API** (`Video_API_BASE_URL`)
- *(optional)* Zoho SMTP credentials for success emails, and a Sentry DSN for error reporting

### 1. Clone & install

```bash
git clone <repo-url> animy
cd animy

# Frontend deps (run from the repo root)
npm install

# Backend deps
cd backend
npm install
cd ..
```

### 2. Configure environment

Both apps read their own `.env`. Copy the examples and fill in real values:

```bash
# Frontend (repo root)
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
```

See [Environment variables](#environment-variables) below for what each value means.

### 3. Run in development

The backend must be started **from the `backend/` directory** (so `dotenv` picks up
`backend/.env`):

```bash
# Terminal 1: backend API (http://localhost:5000)
cd backend
npm run dev

# Terminal 2: frontend (http://localhost:5173)
npm run dev
```

Open <http://localhost:5173>.

> **Windows note:** port `5000` is inside Windows' reserved/excluded port range on some
> machines (`netsh int ipv4 show excludedportrange protocol=tcp`), which makes `http.sys`
> return `403` before your app sees the request. If the API behaves strangely on `5000`,
> set a different `PORT` in `backend/.env` and update `VITE_BACKEND_URL` to match.

---

## Environment variables

### Frontend (`.env` at repo root)

| Variable                     | Required | Description                                            |
| ---------------------------- | :------: | ------------------------------------------------------ |
| `VITE_CLERK_PUBLISHABLE_KEY` |    ✅    | Clerk publishable key (`pk_...`).                      |
| `VITE_BACKEND_URL`           |    ✅    | Base URL of the backend API, e.g. `http://localhost:5000`. |

### Backend (`backend/.env`)

| Variable                | Required | Description                                                        |
| ----------------------- | :------: | ----------------------------------------------------------------- |
| `MONGO_URI`             |    ✅    | MongoDB connection string.                                        |
| `CLERK_SECRET_KEY`      |    ✅    | Clerk secret key (`sk_...`).                                      |
| `CLERK_PUBLISHABLE_KEY` |    ✅    | Clerk publishable key (`pk_...`).                                 |
| `Video_API_BASE_URL`    |    ✅    | Base URL of the external video-generation API.                    |
| `PORT`                  |          | API port (default `5000`).                                        |
| `NODE_ENV`              |          | `development` or `production`.                                    |
| `FRONTEND_URL`          |          | Deployed frontend origin, added to the CORS allow-list.           |
| `CORS_EXTRA_ORIGINS`    |          | Comma-separated extra origins allowed by CORS (dev convenience).  |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | | SMTP settings for success emails. |
| `SENTRY_DSN`            |          | Enables Sentry error reporting when set.                          |

The backend **validates its environment on startup** and exits with a readable message if
a required variable is missing (see `backend/config/env.js`). `localhost:5173` is always
allowed by CORS in addition to the configured origins.

---

## Available scripts

### Frontend (repo root)

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start Vite dev server with HMR.      |
| `npm run build`    | Production build.                    |
| `npm run preview`  | Preview the production build.        |
| `npm run lint`     | Run ESLint.                          |
| `npm test`         | Run Vitest in watch mode.            |
| `npm run test:run` | Run the test suite once (CI mode).   |

### Backend (`backend/`)

| Script           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `npm start`      | Start the API (`node index.js`).               |
| `npm run dev`    | Start with nodemon (auto-reload).              |
| `npm run health` | Probe `GET /health` and exit non-zero on fail. |

---

## API reference

All API routes are prefixed with `/api/v1`, require a valid Clerk session (JWT in the
`Authorization` header), and validate input with zod. Requests are rate-limited
(300 requests / 15 min per client).

| Method   | Endpoint                              | Description                          |
| -------- | ------------------------------------- | ------------------------------------ |
| `GET`    | `/health`                             | Health check (no auth).              |
| `GET`    | `/api/v1/dashboard`                   | Dashboard summary for the user.      |
| `POST`   | `/api/v1/chat`                        | Create a chat + start a generation.  |
| `GET`    | `/api/v1/chat`                        | List the user's chats.               |
| `GET`    | `/api/v1/chat/:chatId`                | Get one chat with its prompts.       |
| `DELETE` | `/api/v1/chat/:chatId`                | Delete a chat (and its media).       |
| `PATCH`  | `/api/v1/chat/:chatId/rename`         | Rename a chat.                       |
| `POST`   | `/api/v1/chat/:chatId/generate`       | Generate another video in a chat.    |
| `GET`    | `/api/v1/chat/:chatId/status/:promptId` | Poll generation status.            |
| `POST`   | `/api/v1/chat/:chatId/kill/:promptId` | Cancel a running generation.         |
| `POST`   | `/api/v1/album`                       | Create an album.                     |
| `GET`    | `/api/v1/album`                       | List albums.                         |
| `GET`    | `/api/v1/album/:albumId`              | Get one album.                       |
| `PATCH`  | `/api/v1/album/:albumId/video`        | Add a finished video to an album.    |
| `DELETE` | `/api/v1/album/:albumId`              | Delete an album.                     |
| `DELETE` | `/api/v1/album/:albumId/video/:videoId` | Remove a video from an album.      |
| `PATCH`  | `/api/v1/album/:albumId/rename`       | Rename an album.                     |
| `PATCH`  | `/api/v1/album/:albumId/video/:videoId/rename` | Rename a video in an album. |

---

## Testing

The frontend uses **Vitest** + **React Testing Library** (jsdom). Tests live next to the
code they cover (`*.test.js` / `*.test.jsx`).

```bash
npm run test:run     # single run
npm test             # watch mode
```

> The Vitest config uses `pool: 'threads'` because the default `forks` pool can hang on
> Windows.

CI (`.github/workflows/ci.yml`) runs lint, tests, and a production build on every push.

---

## Security notes

The API has been hardened against the common issues for this kind of app:

- **Authorization on every resource**: chats, prompts, and albums are always scoped to
  the authenticated user; cross-user access (IDOR) is blocked.
- **No secrets in code**: SMTP credentials and the Sentry DSN come from the environment.
- **Helmet**, a strict **CORS allow-list**, a **1 MB JSON body limit**, and **rate limiting**.
- **zod validation** on all request params/bodies.
- **Atomic multi-step writes** via MongoDB transactions where needed (e.g. creating an
  album, deleting a chat).
- **Structured logging** with pino; sensitive headers (authorization, cookies) are redacted.

> ⚠️ If this repo was ever public with committed credentials, **rotate any leaked secrets**
> (SMTP password, API keys) - git history retains old values even after they're removed.

---

## Deployment

- **Frontend** builds to static assets (`npm run build` → `dist/`) and deploys to any
  static host (e.g. Vercel). Set `VITE_*` variables in the host's env.
- **Backend** runs as a Node process (`npm start`). Set `NODE_ENV=production`, a real
  `FRONTEND_URL`, and all required env vars. Logs are emitted as JSON in production.
- Point `VITE_BACKEND_URL` at the deployed API origin.

---

## License

Proprietary. All rights reserved (update this section if you intend to open-source).
