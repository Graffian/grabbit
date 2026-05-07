# Grabbit - Architecture Overview

## Framework
- **Next.js 14.2.35** (App Router) with React 18 and TypeScript (strict mode)
- Edge Middleware for route protection (`src/middleware.ts`)

## Auth (NextAuth v5 beta)
- Providers: Google OAuth + Phone OTP (Credentials provider, id: "phone")
- Session strategy: JWT
- Adapter: `@auth/prisma-adapter` (stores Accounts, Sessions, VerificationTokens in DB)
- Config: `src/lib/auth.ts`
- Types: `src/types/next-auth.d.ts` (extends session with trustScore, kycStatus, role, subscriptionPlan, phone)

## Routing Structure

### Public routes (no auth required)
- `/` — Landing page
- `/login` — Sign in (phone OTP + Google)
- `/browse` — Browse items (session.user optional)
- `/items/[id]` — Item detail
- `/pricing` — Subscription plans

### Auth-required routes (middleware protects /dashboard, /list-item, /disputes, /admin)
- `/onboarding` — Profile setup (name, city)
- `/onboarding/hear-about-us` — Referral source
- `/onboarding/interests` — Interest categories
- `/kyc` — KYC document upload
- `/list-item` — Multi-step listing form
- `/dashboard/borrower` — Borrower rentals
- `/dashboard/lender` — Lender items/earnings
- `/disputes/[id]` — Dispute detail
- `/admin` — KYC & dispute management
- `/notifications` — In-app notifications

### API Routes
All under `src/app/api/`:
- `auth/send-otp` (POST) — sends SMS via MSG91, returns devOtp in development
- `auth/onboard` (POST) — saves name, city, hearAboutUs, interests
- `auth/kyc` (POST) — submits KYC documents
- `auth/[...nextauth]` — NextAuth handler
- `items/create` (POST) — creates a rental listing
- `bookings/create` (POST) — creates a rental booking
- `payments/create-order` (POST) — Razorpay order creation
- `payments/verify` (POST) — payment signature verification
- `rentals/[id]/approve` (POST) — lender approves rental
- `rentals/[id]/decline` (POST) — lender declines rental
- `rentals/return` (POST) — marks item as returned
- `deposits/create-mandate` (POST) — Razorpay eMandate for deposit
- `deposits/release` (POST) — release deposit to borrower
- `deposits/deduct` (POST) — deduct from deposit (damages)
- `disputes/create` (POST) — create dispute
- `disputes/[id]/resolve` (POST) — admin resolves dispute
- `subscriptions/create` (POST) — create/upgrade subscription
- `admin/kyc` (POST) — admin KYC approve/reject
- `notifications` (GET) — fetch user notifications
- `upload` (POST) — upload images to Cloudinary
- `webhooks/razorpay` (POST) — Razorpay webhook handler

## Data Flow
1. User signs in via phone OTP or Google → JWT token created
2. New users redirected to `/onboarding` → `/onboarding/hear-about-us` → `/onboarding/interests` → `/browse`
3. Browse page fetches items from DB, displays with search/filter/location
4. Item detail shows photos, pricing, owner info, booking calendar
5. Booking creates a rental record → Razorpay payment order → deposit mandate
6. Lender dashboard shows incoming requests → approve/decline
7. On return, deposit released/deducted, trust scores updated, payouts processed

## Key Decisions
- SQLite for simplicity (swap datasource for production Postgres)
- JWT over database sessions for performance
- Trust score as simple integer (0-100) with event-driven adjustments
- Deposits via Razorpay eMandate (holds until return)
- Platform fees deducted from payouts based on subscription tier
- Dark mode via class strategy with next-themes
