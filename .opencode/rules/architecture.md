# Grabbit - Architecture Overview

## Framework
- **Next.js 14.2.35** (App Router) with React 18 and TypeScript (strict mode)
- ESLint with `eslint-config-next` + `next/typescript`
  - Rules: `@typescript-eslint/no-explicit-any: off`, `@next/next/no-img-element: off`, `react/no-unescaped-entities: off`
- PostCSS with Tailwind CSS plugin (`postcss.config.mjs`)
- TypeScript config: `strict: true`, `@/*` path alias mapping to `./src/*`, bundler module resolution, `next-env.d.ts` for Next.js types
- Edge Middleware for route protection (`src/middleware.ts`)

## Project Config
- **`next.config.mjs`** — allows external images from `res.cloudinary.com` (item photos) and `lh3.googleusercontent.com` (Google avatars)
- **`package.json`** — scripts: `dev` (next dev), `build` (next build), `start` (next start), `lint` (next lint)
- **`.gitignore`** — ignores node_modules, .next/, out/, build, .env*.local (but NOT .env itself — security concern), next-env.d.ts, /src/generated/prisma
- **No custom 404 pages** — no `not-found.tsx` at app root or items route

## Auth (NextAuth v5 beta)
- Config: `src/lib/auth.ts`
- Providers: Google OAuth + Phone OTP (Credentials provider, id: "phone")
- Session strategy: JWT (not database sessions)
- Adapter: `@auth/prisma-adapter` (stores Accounts, Sessions, VerificationTokens in DB, though Sessions unused with JWT)
- JWT callback — on sign-in, fetches user from DB and attaches trustScore, kycStatus, role, subscriptionPlan, phone to token
- Session callback — copies JWT claims into session.user
- Update trigger — `jwt()` handles `trigger === "update"` by merging session data into token (used after onboarding to refresh session without re-login)
- Pages config: signIn: "/login", newUser: "/onboarding"
- Types: `src/types/next-auth.d.ts` extends:
  - `Session.user` with id, trustScore, kycStatus, role, subscriptionPlan, phone
  - `User` with trustScore?, kycStatus?, role?, subscriptionPlan?, phone?
  - `JWT` with id, trustScore, kycStatus, role, subscriptionPlan, phone

## Middleware (`src/middleware.ts`)
- Uses `auth()` wrapper from NextAuth v5
- Protected paths (redirect to /login): `/dashboard`, `/list-item`, `/bookings`, `/disputes`, `/admin`
- Auth page redirect (redirect to /browse if logged in): `/login`, `/onboarding`
- Matcher: `/((?!_next/static|_next/image|favicon.ico|api/webhooks|uploads).*)`

## Providers (`src/providers.tsx`)
Client-side provider hierarchy:
```
SessionProvider (next-auth)
  → QueryClientProvider (TanStack React Query v5, new client per component mount)
    → children
    → Toaster (react-hot-toast, position: top-right, 4s duration, dark bg: #1F2937)
```

## State Management
- **Zustand** (`src/store/useAuthStore.ts`) — client-side auth UI state: otpSent (boolean), phone (string), setOtpSent, setPhone, reset
- **TanStack React Query v5** — server state management (notifications fetching, data caching)

## Library Modules (`src/lib/`)

| File | Exports | Purpose |
|---|---|---|
| `auth.ts` | handlers, signIn, signOut, auth | NextAuth config |
| `prisma.ts` | prisma (singleton) | PrismaClient via globalThis pattern |
| `utils.ts` | cn, formatPrice, calculateDeposit, calculateRentalFees, getTrustBadge, getPlatformFeeRate, getDepositMultiplier | Shared utilities |
| `middleware.ts` | requireAuth, requireAdmin | API route auth helpers |
| `cloudinary.ts` | uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary | Image upload/delete to Cloudinary |
| `razorpay.ts` | razorpay, createRazorpayOrder (amount*100), verifyRazorpaySignature (HMAC SHA256), capturePayment, refundPayment, createRazorpaySubscription, createRazorpayPayout | Payment processing |
| `resend.ts` | sendEmail, sendBookingConfirmation, sendPayoutNotification, sendDisputeUpdate | Email via Resend (from: "Grabbit <noreply@grabbit.in>") |
| `msg91.ts` | sendOTP (MSG91 v5 API), sendSMS (MSG91 v2 API), generateOTP (6-digit random) | SMS/OTP |
| `shadcn.ts` | cn (simple joiner) | Alternative classname utility |

### Key Utility Functions (`utils.ts`)
- `cn(...inputs)` — clsx + tailwind-merge
- `formatPrice(amount)` — INR currency with Intl.NumberFormat, no decimals
- `calculateDeposit(itemValue, trustScore)` — max(itemValue * 0.2 * multiplier, 200), multiplier: >80=0.5, >60=0.75, else=1.0
- `calculateRentalFees(dailyRate, totalDays, itemValue, trustScore, protectionFee, deliveryFee, platformFeePercent)` — returns rentalFee, platformFee, depositAmount, taxes (18%), totalPaid
- `getTrustBadge(score)` — {label, color}: ≤40 "New User" gray, ≤60 "Trusted" blue, ≤80 "Reliable" green, >80 "Elite" yellow
- `getPlatformFeeRate(plan)` — FREE=0.15, PLUS=0.12, PRO=0.10
- `getDepositMultiplier(plan)` — FREE=1.0, PLUS=0.75, PRO=0.50

## Routing Structure

### Navbar behavior (`src/components/shared/navbar.tsx`)
- Hidden on: `/`, `/login`, `/onboarding`, `/kyc`
- Sticky top, gradient bg (white→indigo-50→white, dark: gray-950→indigo-950/30→gray-950), backdrop-blur
- Desktop: logo → Browse, List Item (if logged in), Dashboard (if logged in), Bell icon, ThemeToggle, user name + Sign Out button (if logged in) / Sign In button (if not)
- Mobile: hamburger menu with slide-up animation, same links
- Theme toggle: manual class toggle on `<html>`, uses Sun/Moon icons from lucide
- Uses `<img>` for logo (grabbit icon: Package icon in indigo gradient box)

### Public routes (no auth required)
- `/` — Landing page (GlowyWavesHero) — hidden navbar
- `/login` — Sign in (TravelConnectSignIn with Google + Phone) — hidden navbar
- `/browse` — Browse items (session.user optional)
- `/items/[id]` — Item detail with booking
- `/pricing` — Subscription plans (Free/Plus/Pro)

### Auth-required routes (middleware blocks if not logged in)
- `/onboarding` — Profile setup (name, city)
- `/onboarding/hear-about-us` — Referral source selection
- `/onboarding/interests` — Interest category multi-select
- `/kyc` — KYC document upload
- `/list-item` — Multi-step listing form
- `/dashboard/borrower` — Borrower active/history rentals
- `/dashboard/lender` — Lender items/earnings/requests
- `/disputes/[id]` — Dispute detail with evidence
- `/admin` — Admin: KYC approvals table, dispute management
- `/notifications` — In-app notification list

### API Routes
All under `src/app/api/`:

| Method | Route | Purpose |
|---|---|---|
| POST | `auth/send-otp` | Generate 6-digit OTP, store in DB, send via MSG91, return devOtp in dev |
| POST | `auth/onboard` | Save name, city, hearAboutUs, interests to User |
| POST | `auth/kyc` | Submit KYC documents (images stored as JSON array) |
| GET\|POST | `auth/[...nextauth]` | NextAuth handler |
| POST | `items/create` | Create Item record |
| POST | `bookings/create` | Create Rental (PENDING) with calculated fees |
| POST | `payments/create-order` | Create Razorpay order (amount*100) |
| POST | `payments/verify` | HMAC SHA256 signature verification |
| POST | `rentals/[id]/approve` | Status → APPROVED, send notification |
| POST | `rentals/[id]/decline` | Status → CANCELLED, send notification |
| POST | `rentals/return` | Status → COMPLETED, update trust scores, trigger payout |
| POST | `deposits/create-mandate` | Razorpay eMandate for deposit hold |
| POST | `deposits/release` | Release deposit back to borrower |
| POST | `deposits/deduct` | Deduct from deposit with reason |
| POST | `disputes/create` | Create dispute with evidence URLs |
| POST | `disputes/[id]/resolve` | Admin marks RESOLVED with resolution note |
| POST | `subscriptions/create` | Create/upgrade Razorpay subscription |
| POST | `admin/kyc` | Admin approves/rejects KYC submission |
| GET | `notifications` | Fetch user notifications, newest first |
| POST | `upload` | Upload files to Cloudinary, return URLs array |
| POST | `webhooks/razorpay` | Razorpay webhook (payment captured, etc.) |

## Sign-In Flow
1. User lands on `/login` → TravelConnectSignIn component with Google button + "or" divider + Phone button
2. Google: calls `signIn("google", { callbackUrl: "/onboarding" })` — new users redirected to onboarding
3. Phone: shows phone input → `POST /api/auth/send-otp` → OTP input → `signIn("phone", { phone, otp })`
4. Phone auth: looks up OTP in DB (validates not used, not expired), marks used, finds or creates User (with `isVerified: true`), creates TrustEvent (+5), increments trustScore, creates free Subscription
5. Success → JWT created → middleware redirects to `/onboarding` (if newUser) or `/browse`

## Onboarding Flow (new users)
1. `/onboarding` — name + city → saves via `POST /api/auth/onboard` → redirects to `/onboarding/hear-about-us`
2. `/onboarding/hear-about-us` — single-select (Google/Friend/Social Media/Other) → saves `hearAboutUs` → redirects to `/onboarding/interests`
3. `/onboarding/interests` — multi-select chips (Tools/Electronics/Vehicles/Sports/Party & Events/Furniture/Books/Other) → saves `interests` as comma-separated → calls `session.update()` to refresh JWT → redirects to `/browse`

## Booking & Rental Flow
1. User on `/items/[id]` selects dates via DayPicker (react-day-picker v9, range mode)
2. Real-time fee calculation: rentalFee, platformFee, depositAmount, taxes, totalPaid
3. Optional: Protection Plan (none/basic/premium: ₹0/₹49/₹99), Delivery (₹79 toggle)
4. "Rent Now" → `POST /api/bookings/create` → `POST /api/payments/create-order` → Razorpay checkout opens (prefilled phone, key from `NEXT_PUBLIC_RAZORPAY_KEY_ID`)
5. Payment handler → `POST /api/payments/verify` → success redirects to `/dashboard/borrower`
6. Lender sees request in dashboard → approve/decline via API
7. On return → deposit handled, trust scores updated, payout queued

## Key Business Logic
- **Deposit**: `max(itemValue * 0.2 * multiplier, 200)` — multiplier from trust score or subscription plan
- **Platform fee**: 15% FREE / 12% PLUS / 10% PRO of rentalFee
- **Taxes**: 18% GST on (rentalFee + platformFee + protectionFee)
- **Trust score**: integer 0-100, events: PHONE_VERIFIED (+5), RENTAL_COMPLETED (+3), RENTAL_CANCELLED (-2), DISPUTE_LOST (-5)

## Key Decisions
- SQLite for simplicity (swap datasource for production Postgres)
- JWT over database sessions for performance
- Trust score as simple integer (0-100) with event-driven adjustments
- Deposits via Razorpay eMandate (holds until return)
- Platform fees deducted from payouts based on subscription tier
- Dark mode via manual class toggle on `<html>` (no next-themes library)
- Images stored on Cloudinary, URLs stored as JSON string in DB
- Item browse uses server component (fetches) + client component (interactivity)
- Navbar hidden on landing/auth pages, visible everywhere else
- No `not-found.tsx` custom pages — uses default Next.js 404

## Static Assets
- `public/uploads/` — directory for potential local uploads (unused, Cloudinary used instead)
- `src/app/favicon.ico` — default Next.js favicon
- `src/app/globals.css` — Tailwind directives + CSS custom properties (HSL) with light/dark themes
- `src/app/fonts/` — GeistVF.woff, GeistMonoVF.woff (unused, Inter from Google Fonts used in layout)
