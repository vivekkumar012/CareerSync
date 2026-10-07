# 🚀 CareerSync

**CareerSync** is an AI-powered, scalable **Recruitment Platform Web Application** built using **Microservices Architecture** and an **Event-Driven System**.

It connects job seekers and recruiters while providing AI-powered career guidance, resume analysis, job applications, profile management, real-time email notifications, and premium subscriptions.

---

## ✨ Features

- 🔐 JWT-based Authentication
- 👤 Multi-account registration & profile management
- 📄 Resume & profile image upload
- 🤖 AI Resume Analyzer
- 🧠 AI Career Guidance
- 💼 Job search, filtering & applications
- 🏢 Recruiter dashboard
- 📊 Application tracking & status management
- 📧 Real-time email notifications using Nodemailer + Gmail
- 🔑 Forgot & Reset Password
- 💳 Razorpay-based subscription system
- ⚡ Redis caching
- 📨 Kafka-based asynchronous communication

---

## 🏗️ Architecture

CareerSync follows a **Microservices + Event-Driven Architecture**.

```text
                    ┌───────────────┐
                    │    Next.js    │
                    │   Frontend    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  API Gateway  │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   Auth Service        User Service        Job Service
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                    ┌───────────────┐
                    │ Apache Kafka  │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        Email Service   AI Service   Payment Service
              │                           │
              ▼                           ▼
        Gmail/Nodemailer               Razorpay
```

Kafka is used to decouple services and handle asynchronous communication between different parts of the system.

---

## 🧩 Microservices

| Service | Responsibility |
|---|---|
| Auth Service | Registration, login & JWT authentication |
| User Service | Profile, skills, bio & experience |
| Job Service | Job creation, search & management |
| Application Service | Job applications & tracking |
| Upload Service | Resume & image uploads |
| Email Service | Transactional email notifications |
| AI Service | Resume analysis & career guidance |
| Payment Service | Razorpay subscriptions |

---

## 📨 Kafka Event Flow

CareerSync uses **KafkaJS** for event-driven communication.

Example:

```text
Application Created
        ↓
   Kafka Event
        ↓
   Email Service
        ↓
 Nodemailer + Gmail
        ↓
   Email Delivered
```

Example events:

```text
user.created
job.created
application.created
application.status.updated
password.reset.requested
payment.success
payment.failed
```

---

## 🤖 AI Features

### AI Resume Analyzer
- Resume analysis
- Skill extraction
- Improvement suggestions
- Skill-gap identification
- Job-role alignment

### AI Career Guide
Provides personalized career guidance based on the user's:

- Skills
- Experience
- Resume
- Career goals

---

## 💳 Payment System

CareerSync uses **Razorpay** for premium subscriptions.

```text
User → Payment Service → Razorpay
                     ↓
              Payment Verification
                     ↓
                PostgreSQL
                     ↓
             Subscription Active
```

---

## 🛠️ Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- Node.js
- Express.js
- TypeScript
- REST APIs

### Infrastructure
- Apache Kafka
- KafkaJS
- Redis
- PostgreSQL

### Integrations
- AI / LLM
- Nodemailer
- Gmail SMTP
- Razorpay

### DevOps
- Docker
- Docker Compose
- CI/CD

---

## 📁 Project Structure

```text
CareerSync/
├── frontend/
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── job-service/
│   ├── application-service/
│   ├── upload-service/
│   ├── email-service/
│   ├── ai-service/
│   └── payment-service/
├── shared/
├── infrastructure/
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/<username>/CareerSync.git
cd CareerSync
```

### Install dependencies

```bash
npm install
```

### Start infrastructure

```bash
docker compose up -d
```

### Run the services

```bash
npm run dev
```

Create `.env` files for database, Kafka, Redis, Gmail, Razorpay and AI credentials.

---

## 🎯 Project Goal

CareerSync is built to demonstrate real-world engineering concepts including:

- Microservices Architecture
- Event-Driven Systems
- Apache Kafka
- Scalable Backend Design
- AI Integration
- Distributed communication
- Payment integration
- Production-oriented authentication
- Caching & asynchronous processing

---

## 👨‍💻 Author

**Vivek Kumar**  
B.Tech — Information Technology

**Interests:** Full Stack Development • Backend Engineering • Microservices • DevOps • AI & Agentic Systems

---

⭐ If you find CareerSync useful, consider giving the repository a star!