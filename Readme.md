<p align="center">
  <img src="frontend/public/careersync-logo.png" alt="CareerSync logo" width="96" />
</p>

<h1 align="center">CareerSync</h1>

<p align="center">
  An AI-powered recruitment platform built with <b>microservices</b> and an <b>event-driven architecture</b>.
</p>

<p align="center">
  Next.js · Node.js · TypeScript · PostgreSQL · Redis · Kafka · Google Gemini · Razorpay · Docker · Prometheus · Grafana
</p>

---

CareerSync connects job seekers and recruiters. Job seekers search jobs, apply with screening answers, track every application round by round, and get AI feedback on their resume. Recruiters create companies, post jobs with their own hiring pipeline, and move candidates through it in bulk. Admins moderate users, jobs and companies.

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Services](#services)
- [Tech stack](#tech-stack)
- [Engineering highlights](#engineering-highlights)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Running with Docker](#running-with-docker)
- [Monitoring](#monitoring)
- [Testing and CI](#testing-and-ci)
- [Deployment](#deployment)
- [API reference](#api-reference)
- [Roadmap](#roadmap)
- [Author](#author)

## Features

**Job seekers**
- Register with a resume, log in, reset a forgotten password by email
- Profile with photo, bio, resume and skills
- Search jobs by title and location, with pagination
- Detailed job pages: hiring rounds, skills, eligibility, CTC/stipend, attachments
- Apply with a named resume and answer the recruiter's screening questions
- Application tracker with a round-by-round timeline
- **AI resume analyser**: ATS score, score breakdown, strengths and prioritised fixes
- **AI career guide**: suitable roles and a learning roadmap from your skills
- **Premium subscription** (Razorpay, ₹119 / 30 days): your applications appear first to recruiters

**Recruiters**
- Create and delete companies with logos
- Post and edit jobs with a custom hiring pipeline (rounds), tags, skills, screening questions and PDF attachments
- See applicants (subscribers first) with their answers
- Move many applicants to a round at once with a status and note; applicants are emailed about status changes

**Admins**
- List all users, jobs and companies
- Activate or deactivate any job

## Architecture

```text
                         ┌──────────────────────┐
                         │   Next.js frontend   │  :3000
                         └──────────┬───────────┘
                                    │  HTTPS
                         ┌──────────▼───────────┐       ┌──────────────────┐
                         │     API Gateway      │ :8080 │      Redis       │
                         │ proxy · rate limit   │──────►│ cache · limits · │
                         └──────────┬───────────┘       │ tokens           │
                                    │                   └──────────────────┘
      ┌──────────────┬──────────────┼──────────────┬──────────────┐
      ▼              ▼              ▼              ▼              ▼
 ┌─────────┐   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
 │  Auth   │   │  Utils  │    │  User   │    │   Job   │    │ Payment │
 │  :5000  │   │  :5001  │    │  :5002  │    │  :5003  │    │  :5004  │
 └────┬────┘   └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
      │             │              │              │              │
      │    Cloudinary · Gemini     │              │           Razorpay
      │    Gmail SMTP              │              │
      ▼                            ▼              ▼              ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │                       PostgreSQL (Neon)                          │
 └──────────────────────────────────────────────────────────────────┘

  Auth ──┐
         ├──► Kafka topic "send-mail" ──► Utils (consumer) ──► Gmail SMTP
  Job  ──┘
```

- The browser only talks to the **gateway**, which forwards `/api/<service>` to the right service and applies a global rate limit.
- Every service runs the same middleware chain from the shared package: request logging, metrics, rate limiting, JWT auth, role checks, Zod validation and error handling.
- Emails are sent **asynchronously**: the API publishes a Kafka event and responds immediately, and the utils service consumes it.

## Services

| Service | Port | Responsibility |
|---|---|---|
| **gateway** | 8080 | Single entry point; proxies `/api/*` to services, rate limit, CORS |
| **auth** | 5000 | Register, login, refresh-token rotation, logout, forgot/reset password |
| **utils** | 5001 | Cloudinary uploads, Gemini AI (resume analyser, career guide), Kafka email consumer |
| **user** | 5002 | Profile, photo, resume, skills, applying to jobs, my applications |
| **job** | 5003 | Companies, jobs, hiring rounds, applicants, stage updates, admin moderation |
| **payment** | 5004 | Razorpay order creation and signature verification |
| **packages/common** | — | Shared library: errors, validation, tokens, roles, Redis cache, rate limiter, Kafka client, logger, metrics, health check |

## Tech stack

| Area | Technologies |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix UI), Axios, react-hot-toast, react-slick |
| Backend | Node.js 22, Express 5, TypeScript, Zod, JWT, bcrypt, Multer |
| Data | PostgreSQL (Neon serverless), Redis |
| Messaging | Apache Kafka (KafkaJS) |
| Integrations | Google Gemini, Cloudinary, Razorpay, Nodemailer + Gmail SMTP |
| DevOps | npm workspaces monorepo, Docker (multi-stage), Docker Compose, GitHub Actions |
| Observability | pino logs, prom-client, Prometheus, Grafana |
| Testing | Vitest |

## Engineering highlights

- **Access + refresh tokens.** 15-minute access tokens and 7-day refresh tokens. Refresh tokens are rotated on every use and tracked in Redis; logout blacklists the access token in Redis so it stops working immediately in every service.
- **Redis caching** of job lists, job details and company pages, invalidated by key prefix whenever data changes.
- **Redis rate limiting** at the gateway and in each service, with stricter limits on login/forgot/reset (10 per 15 min) and on AI endpoints (10 per minute).
- **Validation** of every request body, param and query with Zod.
- **Recruiter-defined hiring pipelines** with an audit history per application, bulk stage updates, and automatic Hired/Rejected status sync.
- **Consistency**: multi-table writes use database transactions; duplicate applications are blocked by a unique constraint.
- **Secure payments**: Razorpay signatures are verified server-side with HMAC-SHA256 before a subscription is activated.
- **Resilient frontend**: an Axios interceptor refreshes expired tokens transparently and retries safe requests on 502/503 (cold starts).

## Project structure

```text
CareerSync/
├── packages/
│   └── common/              # @careersync/common — shared by every service
├── services/
│   ├── gateway/
│   ├── auth/
│   ├── user/
│   ├── job/
│   ├── payment/
│   └── utils/
├── frontend/                # Next.js app
├── monitoring/
│   ├── prometheus/          # scrape config
│   └── grafana/             # datasource + dashboard provisioning
├── Dockerfile.service       # one multi-stage Dockerfile for all services
├── docker-compose.yml       # full local stack
├── .github/workflows/ci.yml
└── package.json             # npm workspaces root
```

Each service follows the same layout: `src/index.ts` (startup and table creation), `src/app.ts`, `src/routes/`, `src/controllers/`, `src/middlewares/`, `src/validators.ts`, `src/utils/`.

## Getting started

### Prerequisites

- Node.js 22
- Docker (for Kafka, and optionally Redis)
- Accounts for: [Neon](https://neon.tech) (PostgreSQL), [Cloudinary](https://cloudinary.com), [Google AI Studio](https://aistudio.google.com) (Gemini key), [Razorpay](https://razorpay.com) (test keys), and a Gmail app password for SMTP. Redis can be local (Docker) or [Upstash](https://upstash.com).

### 1. Install

```bash
git clone https://github.com/<username>/CareerSync.git
cd CareerSync
npm install
npm run build --workspace=@careersync/common
```

### 2. Environment variables

Every service has a `.env.example`. Copy it to `.env` in the same folder and fill in your values.

| File | Variables |
|---|---|
| `services/auth/.env` | `PORT`, `DB_URL`, `UPLOAD_SERVICE`, `JWT_SEC`, `Kafka_Broker`, `Frontend_Url`, `Redis_url` |
| `services/user/.env` | `PORT`, `DB_URL`, `UPLOAD_SERVICE`, `JWT_SEC`, `Redis_url` |
| `services/job/.env` | `PORT`, `DB_URL`, `UPLOAD_SERVICE`, `JWT_SEC`, `Kafka_Broker`, `Redis_url` |
| `services/utils/.env` | `PORT`, `CLOUD_NAME`, `API_KEY`, `API_SECRET`, `Kafka_Broker`, `SMTP_USER`, `SMTP_PASS`, `GOOGLE_API_KEY`, `Redis_url` |
| `services/payment/.env` | `PORT`, `Razorpay_Key`, `Razorpay_Secret`, `DB_URL`, `JWT_SEC`, `Redis_url` |
| `services/gateway/.env` | `PORT`, `Redis_url` (service URLs default to localhost) |
| `frontend/.env` | `NEXT_PUBLIC_API_GATEWAY_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` |

Notes:
- `JWT_SEC` and `Redis_url` must be **the same in every service** — tokens are signed by auth and verified (and revoked) everywhere else.
- For Upstash use the TLS URL: `rediss://default:<password>@<host>.upstash.io:6379`.
- For a hosted Kafka (e.g. Redpanda) also set `KAFKA_USERNAME`, `KAFKA_PASSWORD` and `KAFKA_SASL_MECHANISM`.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` must be the same key id as `Razorpay_Key`.

### 3. Start Kafka (and Redis, if not using Upstash)

```bash
docker compose up -d zookeeper kafka
docker compose up -d redis          # only for local Redis
```

### 4. Start the services

Open one terminal per service. Start Kafka first so the services can connect to it.

```bash
cd services/utils   && npm run dev
cd services/auth    && npm run dev
cd services/user    && npm run dev
cd services/job     && npm run dev
cd services/payment && npm run dev
cd services/gateway && npm run dev
```

Database tables are created automatically on first start.

### 5. Start the frontend

```bash
cd frontend && npm run dev
```

Open http://localhost:3000.

> Admin accounts can't be self-registered. To make one, set `role = 'admin'` for a user directly in the database.

## Running with Docker

The whole stack — Redis, Kafka, the six services, the frontend, Prometheus and Grafana — runs with one command (each service still reads its own `.env` file):

```bash
docker compose up -d --build
```

All services share `Dockerfile.service`, which builds the shared package and the selected service in a builder stage and copies only the compiled output into a small `node:22-alpine` image:

```bash
docker build -f Dockerfile.service --build-arg SERVICE=auth -t careersync-auth .
```

## Monitoring

Every service exposes `GET /health` and `GET /metrics` (Prometheus format).

| Tool | URL | What you get |
|---|---|---|
| Prometheus | http://localhost:9090 | Scrapes every service every 5 s |
| Grafana | http://localhost:3001 (admin / admin) | Pre-built *CareerSync Microservices Overview* dashboard: service up/down, requests per second, P95 latency, 4xx/5xx errors, in-flight requests, memory, Redis cache hits vs misses |

Metrics include `http_request_duration_seconds`, `http_requests_total`, `http_requests_in_flight`, `redis_cache_hits_total`, `redis_cache_misses_total`, `rate_limit_exceeded_total` and `kafka_messages_total`.

## Testing and CI

```bash
npm run typecheck --workspaces --if-present
npm test --workspace=@careersync/common     # or run "npx vitest run" inside any service
```

58 Vitest unit tests cover the shared package (tokens, rate limiter, cache, validation, roles, error handling, metrics, Kafka config) and each service's request schemas.

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request to `main`: install, build the shared package, typecheck all workspaces, build all workspaces, and run all tests.

## Deployment

A free-tier setup that works for this project:

| Part | Platform |
|---|---|
| Frontend | Vercel (root directory `frontend`) |
| Six services | Render web services |
| PostgreSQL | Neon |
| Redis | Upstash |
| Kafka | Redpanda Serverless |

Render build and start commands for a service (replace `auth` with the service name):

```bash
npm ci && npm run build --workspace=@careersync/common && npm run build --workspace=services/auth
node services/auth/dist/index.js
```

Point the gateway's `*_SERVICE_URL` variables at the deployed services, set `UPLOAD_SERVICE` to the utils URL, set `Frontend_Url` to the Vercel URL, and set the frontend's `NEXT_PUBLIC_API_GATEWAY_URL` to the gateway URL.

## API reference

All routes are reached through the gateway, e.g. `http://localhost:8080/api/auth/login`. 🔒 = requires `Authorization: Bearer <accessToken>`.

<details>
<summary><b>Auth</b> — <code>/api/auth</code></summary>

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Register (multipart; job seekers attach a resume as `file`) |
| POST | `/login` | Log in; returns user, access token and refresh token |
| POST | `/refresh` | Exchange a refresh token for a new token pair |
| POST | `/logout` | Revoke the refresh token and blacklist the access token |
| POST | `/forgot` | Email a password-reset link |
| POST | `/reset/:token` | Set a new password |

</details>

<details>
<summary><b>User</b> — <code>/api/user</code></summary>

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/me` | Current user |
| GET 🔒 | `/:userId` | A user's profile |
| PUT 🔒 | `/update/profile` | Update name, phone, bio |
| PUT 🔒 | `/update/pic` | Upload profile photo |
| PUT 🔒 | `/update/resume` | Upload resume |
| POST 🔒 | `/skill/add` | Add a skill |
| PUT 🔒 | `/skill/delete` | Remove a skill |
| POST 🔒 | `/apply/job` | Apply to a job with screening answers |
| GET 🔒 | `/application/all` | My applications |
| GET 🔒 | `/admin/users` | All users (admin) |

</details>

<details>
<summary><b>Job</b> — <code>/api/job</code></summary>

| Method | Path | Description |
|---|---|---|
| POST 🔒 | `/company/new` | Create a company with a logo (recruiter) |
| DELETE 🔒 | `/company/:companyId` | Delete a company and its jobs |
| GET 🔒 | `/company/all` | My companies |
| GET | `/company/:id` | Company with its jobs |
| POST 🔒 | `/new` | Post a job with rounds, tags, skills, questions and details |
| PUT 🔒 | `/:jobId` | Update a job |
| POST 🔒 | `/:jobId/attachments` | Upload a PDF attachment |
| GET | `/all` | Active jobs (`title`, `location`, `page`, `limit`) |
| GET | `/:jobId` | Full job details |
| GET 🔒 | `/application/:jobId` | Applicants for a job (recruiter) |
| PUT 🔒 | `/application/update/:id` | Set application status |
| PUT 🔒 | `/application/stage` | Move applications to a round (bulk) |
| GET 🔒 | `/application/:id/summary` | Application summary |
| GET 🔒 | `/application/:id/history` | Round-by-round history |
| GET 🔒 | `/admin/jobs` | All jobs (admin) |
| PUT 🔒 | `/admin/jobs/:jobId/active` | Activate / deactivate a job (admin) |
| GET 🔒 | `/admin/companies` | All companies (admin) |

</details>

<details>
<summary><b>Utils</b> — <code>/api/utils</code></summary>

| Method | Path | Description |
|---|---|---|
| POST | `/upload` | Upload a base64 file to Cloudinary (used internally by other services) |
| POST | `/career` | AI career guidance from a list of skills |
| POST | `/resume-analyser` | AI ATS analysis of a PDF resume |

</details>

<details>
<summary><b>Payment</b> — <code>/api/payment</code></summary>

| Method | Path | Description |
|---|---|---|
| POST 🔒 | `/checkout` | Create a Razorpay order |
| POST 🔒 | `/verify` | Verify the payment signature and activate the subscription |

</details>

## Roadmap

- Consume the `application-stage-updated` Kafka event for real-time (WebSocket) tracker updates and stage-change emails
- Retry and dead-letter handling for the email consumer
- Database-per-service instead of one shared database
- httpOnly cookies for tokens
- Integration and end-to-end tests
- Full-text job search

## Author

**Vivek Kumar**
B.Tech — Information Technology

**Interests:** Full Stack Development • Backend Engineering • Microservices • DevOps • AI & Agentic Systems

---

⭐ If you find CareerSync useful, consider giving the repository a star!
