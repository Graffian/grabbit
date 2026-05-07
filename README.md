# Grabbit - Peer-to-Peer Rental Marketplace

Grabbit is a full-stack peer-to-peer rental marketplace built with **Next.js 14**, **Prisma (SQLite)**, **NextAuth v5**, and **Razorpay**. Users can list items for rent, browse nearby listings, book with date-based availability, and manage rentals through borrower/lender dashboards.

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Auth** | NextAuth v5 — Google OAuth + Phone OTP (via MSG91) |
| **Database** | Prisma ORM + SQLite |
| **UI** | Tailwind CSS, shadcn/ui components (Radix primitives), Framer Motion |
| **Payments** | Razorpay (orders, captures, subscriptions, deposits via mandates) |
| **Media** | Cloudinary (image uploads) |
| **Email** | Resend (booking confirmations, notifications) |
| **State** | Zustand (client state), TanStack React Query (server state) |
| **Validation** | Zod, react-aria-components (date pickers, forms) |

## Features

- **Phone OTP + Google sign-in** with JWT sessions
- **Onboarding flow** — name, city, referral source, interests
- **Browse items** — search, category filters, location detection, featured carousel, expandable read-more cards
- **Item listing** — multi-step form with image upload (Cloudinary), category-based price suggestions, availability calendar
- **Booking & rentals** — date range picker, deposit calculation, Razorpay payment orders
- **Dual dashboards** — borrower view (active/returned rentals) & lender view (listed items, earnings, requests)
- **Trust scoring** — events that adjust trust scores, affecting deposit requirements
- **Subscription tiers** — Free / Plus / Pro (reduces platform fees and deposits)
- **KYC verification** — document upload with admin approval workflow
- **Dispute resolution** — raise disputes with evidence, admin resolves
- **Notifications** — in-app + email alerts for booking, payout, dispute events
- **Dark mode** — class-based toggling via next-themes
- **Admin panel** — manage KYC approvals and dispute resolution

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone <repo-url>
cd grabbit
npm install
```

### 2. Environment variables

Copy the `.env` file and fill in the values:

```env
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL="file:./dev.db"
RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MSG91_AUTH_KEY=your-msg91-key
MSG91_TEMPLATE_ID=your-template-id
RESEND_API_KEY=re_xxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
```

### 3. Set up the database

```bash
npx prisma db push
```

This creates the SQLite database (`prisma/dev.db`) and generates the Prisma client.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Useful commands

```bash
npm run build         # Production build
npm run start         # Start production server
npx prisma studio     # Database GUI
npx prisma generate   # Regenerate client after schema changes
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, onboarding, KYC
│   │   ├── login/
│   │   ├── onboarding/   # Onboarding, hear-about-us, interests
│   │   └── kyc/
│   ├── browse/           # Item browsing with search/filters
│   ├── items/[id]/       # Item detail page
│   ├── list-item/        # Multi-step listing form
│   ├── dashboard/        # Borrower & lender dashboards
│   ├── disputes/[id]/    # Dispute detail
│   ├── admin/            # Admin dashboard
│   ├── notifications/    # User notifications
│   ├── pricing/          # Subscription plans
│   └── api/              # API routes (auth, items, payments, etc.)
├── components/
│   ├── ui/               # shadcn-style primitives
│   └── shared/           # Navbar, trust badge, skeleton
├── lib/                  # Auth config, Prisma client, utilities, payment helpers
├── store/                # Zustand stores
├── types/                # TypeScript type extensions
└── middleware.ts         # Route protection
```

## API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/send-otp` | Send phone OTP |
| POST | `/api/auth/onboard` | Complete onboarding |
| POST | `/api/auth/kyc` | Submit KYC documents |
| GET\|POST | `/api/auth/[...nextauth]` | NextAuth handler |
| POST | `/api/items/create` | Create a listing |
| POST | `/api/bookings/create` | Create a rental booking |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment signature |
| POST | `/api/rentals/[id]/approve` | Approve rental request |
| POST | `/api/rentals/[id]/decline` | Decline rental request |
| POST | `/api/rentals/return` | Mark item as returned |
| POST | `/api/deposits/create-mandate` | Create deposit mandate |
| POST | `/api/deposits/release` | Release deposit |
| POST | `/api/deposits/deduct` | Deduct from deposit |
| POST | `/api/disputes/create` | File a dispute |
| POST | `/api/disputes/[id]/resolve` | Admin resolve dispute |
| POST | `/api/subscriptions/create` | Create/upgrade subscription |
| POST | `/api/admin/kyc` | Admin KYC action |
| GET | `/api/notifications` | Fetch notifications |
| POST | `/api/upload` | Upload images |
| POST | `/api/webhooks/razorpay` | Razorpay webhook |

## Deployment

Build the production bundle:

```bash
npm run build
```

Deploy the `.next/` folder to any Node.js host (Vercel, Railway, etc.). Ensure all environment variables are configured on the deployment platform. The SQLite database (`dev.db`) can be replaced with PostgreSQL by swapping the Prisma datasource provider.
