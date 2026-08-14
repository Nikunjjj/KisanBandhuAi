# KisanBandhu - Smart Government Scheme Portal for Farmers

KisanBandhu is a production-ready full-stack major project scaffold for a multilingual, mobile-friendly government scheme portal for farmers. Phase 1 implements authentication, secure farmer profile management, role-based access, protected routes, and the farmer dashboard foundation.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios, Recharts
- Backend: Node.js, Express.js, MongoDB Atlas, JWT, bcrypt
- Future-ready integrations: Cloudinary/Firebase Storage, OpenWeather, translation, speech, AI chatbot/RAG, FCM notifications

## Project Structure

```txt
kisanbandhu/
  client/   React app
  server/   Express API
```

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure backend:

```bash
cp server/.env.example server/.env
```

Set `MONGODB_URI`, `JWT_SECRET`, and email credentials.

3. Configure frontend:

```bash
cp client/.env.example client/.env
```

4. Run both apps:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Phase 1 Features

- Farmer and admin registration
- Login with JWT authentication
- Password hashing with bcrypt
- Email/OTP verification flow
- Password reset request and confirmation
- Protected backend routes
- Protected frontend routes
- Role-based access foundation
- Farmer profile dashboard
- Profile fields for state, district, village, land size, crops, income category, livestock, and preferred language

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`

## Phase 2 - Scheme Management

- `GET /api/schemes` with `search`, `category`, `state`, `ministry`, `trending`, `latest`, and `deadline=open` filters
- `GET /api/schemes/meta`
- `GET /api/schemes/bookmarks`
- `GET /api/schemes/:id`
- `POST /api/schemes/:id/bookmark`
- `POST /api/schemes` Admin only
- `PUT /api/schemes/:id` Admin only
- `DELETE /api/schemes/:id` Admin only

Seed demonstration records after configuring `server/.env`:

```bash
npm run seed:schemes --prefix server
```

Create an admin account for scheme CRUD:

```bash
npm run create:admin --prefix server -- --name="Admin User" --email=admin@example.com --phone=9999999999 --password=AdminPass123
```

## Phase 3 - Smart Recommendation Engine

- `GET /api/recommendations` returns personalized ranked schemes for the logged-in farmer.
- `GET /api/recommendations/eligibility/:schemeId` returns an eligibility prediction for one scheme.
- Ranking factors include state, land size, crop type, income category, livestock ownership, farmer category, trending status, and deadline status.
- Frontend dashboard: `/recommendations`.

## Phase 4 - Multilingual Support & Accessibility

- Supported languages: English, Hindi, and Kannada.
- Language selector is available in the app header and mobile sidebar.
- Large text accessibility mode is persisted per user browser.
- Scheme explorer supports voice search using browser speech recognition.
- Scheme detail pages include a visible `Listen` button using browser text-to-speech narration.
- Farmer-facing scheme categories and key scheme terms are localized for Hindi and Kannada.

## Phase 5 - AI Chatbot Assistant

- `POST /api/chatbot/message` answers authenticated farmer questions using intent recognition, farmer profile context, scheme search, and recommendation scores.
- Add `OPENAI_API_KEY` in `server/.env` to let the chatbot generate broader, more natural answers with the configured `OPENAI_MODEL`; without it, the local rule-based answer still works.
- Chatbot supports government scheme questions, eligibility queries, application help, crop insurance, solar subsidy, DBT, irrigation, livestock, and farming support.
- Frontend chat route: `/chatbot`.
- Includes suggested prompts, contextual scheme result cards, multilingual UI, voice input, and listen-to-reply support.
- The backend keeps the same frontend contract whether it uses OpenAI-backed answers or the local rule-based fallback.
# kisanBandhu-2
