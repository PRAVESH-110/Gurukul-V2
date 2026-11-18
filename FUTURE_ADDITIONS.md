# Future Additions: Advanced Engineering Roadmap

This document serves as the implementation blueprint for advanced full-stack systems engineering features for the **Gurukul Platform**. These features are designed to be added after solidifying core LMS workflows.

---

## Table of Contents
1. [Track 1: Real-Time Community Chat (WebSockets / Socket.io)](#1-real-time-community-chat-websockets--socketio)
2. [Track 2: Streaming AI Assistant (Server-Sent Events - SSE)](#2-streaming-ai-assistant-server-sent-events---sse)
3. [Track 3: Asynchronous Background Job Queue (Redis + BullMQ)](#3-asynchronous-background-job-queue-redis--bullmq)
4. [Track 4: Production Payment Processing & Webhooks (Stripe)](#4-production-payment-processing--webhooks-stripe)
5. [Track 5: Production Readiness: Docker & Automated CI/CD (GitHub Actions)](#5-production-readiness-docker--automated-cicd-github-actions)

---

## 1. Real-Time Community Chat (WebSockets / Socket.io)

### Overview
Upgrade community discussions from asynchronous forum posts to persistent, low-latency live chat rooms with online presence and typing indicators.

### Architecture
- **Protocol**: WebSockets (`wss://`) with fallback to HTTP long-polling via Socket.io.
- **State Management**: Socket.io Rooms scoped to `communityId`.
- **Authentication**: JWT token passed in Socket handshake auth payload (`socket.handshake.auth.token`).
- **Persistence**: Messages persisted to MongoDB `ChatMessage` collection with pagination (`cursor-based`).

### Key Implementation Steps
1. **Backend**:
   - Attach Socket.io server to the Express HTTP server in `backend/bin/www` or `backend/app.js`.
   - Create `backend/sockets/communityChat.js` with event handlers:
     - `join_room`: Joins `community_<id>` room after verifying community membership.
     - `send_message`: Emits to room and saves message document.
     - `typing_start` / `typing_stop`: Broadcasts typing state to room peers.
     - `disconnect`: Updates presence state.
2. **Frontend**:
   - Install `socket.io-client` in `frontend-next`.
   - Create a singleton `useCommunitySocket(communityId)` React hook.
   - Build a real-time chat drawer in `CommunityDetail.js` with auto-scroll and unread counters.

### Resume Impact
> *"Architected real-time room-based community messaging using Socket.io and Node.js, implementing JWT socket authentication, presence tracking, and typing indicators with sub-50ms message latency."*

---

## 2. Streaming AI Assistant (Server-Sent Events - SSE)

### Overview
Transform the Gurukul AI guide from a blocking batch request (`res.json`) to a real-time token-streaming interface (similar to ChatGPT), significantly improving perceived latency.

### Architecture
- **Protocol**: HTTP with `Content-Type: text/event-stream` and chunked transfer encoding.
- **Backend Flow**:
  - Receive `POST /api/chat/stream`.
  - Set SSE headers:
    ```javascript
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    ```
  - Call `createChatClient().stream([systemPrompt, ...messages])` from `@langchain/openai`.
  - Pipe each token to client via `res.write(`data: ${JSON.stringify({ token: chunk.content })}\n\n`)`.
  - Send `data: [DONE]\n\n` when complete.
- **Frontend Flow**:
  - Use native `fetch` with `response.body.getReader()`.
  - Decode chunks with `new TextDecoder()` and append tokens progressively to the message UI.

### Resume Impact
> *"Engineered token-by-token AI streaming interface via Server-Sent Events (SSE) and LangChain, reducing Time-To-First-Token (TTFT) by 70% while embedding direct database-backed course recommendation cards."*

---

## 3. Asynchronous Background Job Queue (Redis + BullMQ)

### Overview
Decouple compute-heavy tasks (video transcoding, thumbnail extraction, bulk certificate generation, email newsletters) from the Express HTTP event loop.

### Architecture
- **Message Broker**: Redis.
- **Queue Manager**: BullMQ (`Queue`, `Worker`, `QueueEvents`).
- **Pattern**: Asynchronous Request-Reply (Producer enqueues job and returns `jobId` in 10ms; Consumer processes job off-thread; Client polls progress or receives notification).

### Key Implementation Steps
1. **Queue Setup**:
   - Create `backend/queues/videoQueue.js` and `backend/workers/videoWorker.js`.
   - Define job processors for:
     - Video thumbnail generation via `ffmpeg`.
     - Video duration and metadata extraction.
     - HLS adaptive bitrate transcoding (720p, 1080p).
2. **API Contract**:
   - `POST /api/videos/upload` $\rightarrow$ Enqueues job $\rightarrow$ Returns `202 Accepted { jobId, status: 'queued' }`.
   - `GET /api/videos/jobs/:jobId` $\rightarrow$ Returns `{ status, progress: 65% }`.

### Resume Impact
> *"Designed an asynchronous background processing pipeline using Redis and BullMQ, offloading video metadata extraction and thumbnail generation from the HTTP request cycle to ensure 99.9% API availability."*

---

## 4. Production Payment Processing & Webhooks (Stripe)

### Overview
Replace free instant enrollments with a real commercial checkout flow supporting credit cards, refunds, and creator earnings payouts.

### Architecture
- **Checkout Provider**: Stripe Checkout API (Hosted Session) or Stripe Elements.
- **Security**: Cryptographic signature validation on incoming Stripe webhooks using `stripe.webhooks.constructEvent(rawBody, signature, endpointSecret)`.
- **Database Consistency**: MongoDB ACID multi-document transactions to guarantee student enrollment and creator revenue update occur atomically.

### Key Implementation Steps
1. **Checkout Session**:
   - `POST /api/payments/create-checkout-session` creates a Stripe session with `metadata: { courseId, studentId }`.
   - Returns `{ checkoutUrl }` to redirect the user.
2. **Webhook Listener**:
   - `POST /api/payments/webhook` listens for `checkout.session.completed`.
   - Verifies signature using raw request body.
   - Idempotently creates `Enrollment`, updates `Course.enrollmentCount`, increments creator balance, and sends email receipt.

### Resume Impact
> *"Implemented end-to-end payment processing with Stripe Checkout, utilizing cryptographically verified webhooks and MongoDB ACID transactions to enforce idempotent enrollments and creator revenue splits."*

---

## 5. Production Readiness: Docker & Automated CI/CD (GitHub Actions)

### Overview
Standardize local development environments and automate linting, formatting, security scanning, and integration testing on every commit.

### Key Implementation Steps
1. **Containerization (`docker-compose.yml`)**:
   - Service 1: `frontend` (Next.js multi-stage build).
   - Service 2: `backend` (Node.js Express).
   - Service 3: `mongodb` (Mongo with persistent volume).
   - Service 4: `redis` (Cache & BullMQ queue).
2. **Automated CI/CD Pipeline (`.github/workflows/ci.yml`)**:
   - Trigger on push and pull requests to `master`.
   - Steps:
     - Checkout code.
     - Install dependencies.
     - Run `npm run check` (ESLint + Prettier).
     - Run integration test suite (Jest + Supertest).
     - Run security audit (`npm audit`).

### Resume Impact
> *"Constructed automated CI/CD pipeline using GitHub Actions, Jest, and Docker Compose, enforcing zero-regression deployments, automated linting, and end-to-end integration testing."*
