# Grabbit - Database Schema (SQLite via Prisma)

## Connection
- Datasource: SQLite (`file:./dev.db`)
- ORM: Prisma v5.22 with `prisma-client-js` generator
- Environment: `DATABASE_URL="file:./dev.db"`

## Models (13 total)

### User (`users`)
Core user model supporting phone OTP + Google OAuth auth.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| name | String? | — | From onboarding or Google profile |
| phone | String | — | **Unique**. Auth identifier for phone users |
| email | String? | — | **Unique**. From Google OAuth |
| avatar | String? | — | Google avatar or uploaded |
| city | String? | — | From onboarding |
| hearAboutUs | String? | — | Referral source (Google/Friend/Social Media/Other) |
| interests | String? | — | Comma-separated category interests (Tools, Electronics, etc.) |
| trustScore | Int | 50 | 0-100 scale |
| role | String | "USER" | "USER" or "ADMIN" |
| isVerified | Boolean | false | Phone verified flag |
| kycStatus | String | "NOT_SUBMITTED" | Enum: NOT_SUBMITTED / PENDING / APPROVED / REJECTED |
| stripeAccountId | String? | — | Unused (Razorpay used instead) |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | updatedAt | |

Relations:
- `ownedItems` → Item[] (via ownerId)
- `lentRentals` → Rental[] (via lenderId, relation name "LenderRentals")
- `borrowedRentals` → Rental[] (via borrowerId, relation name "BorrowerRentals")
- `reviewsGiven` → Review[] (via reviewerId, relation name "Reviewer")
- `reviewsReceived` → Review[] (via revieweeId, relation name "Reviewee")
- `trustEvents` → TrustEvent[]
- `disputes` → Dispute[] (via raisedById, relation name "DisputeRaiser")
- `payouts` → Payout[]
- `subscription` → Subscription? (one-to-one)
- `notifications` → Notification[]
- `accounts` → Account[] (NextAuth)
- `sessions` → Session[] (NextAuth, unused with JWT)

### Item (`items`)
Listings available for rent.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| title | String | — | |
| description | String | — | |
| category | String | — | |
| dailyRate | Float | — | Price per day in INR |
| weeklyRate | Float? | — | Discounted weekly price |
| itemValue | Float | — | Used for deposit calc (20% min ₹200) |
| condition | String | "Good" | Enums: New / Like New / Good / Fair |
| images | String | "[]" | JSON array of Cloudinary URLs |
| location | String | — | City name string |
| lat | Float? | — | For future geo queries |
| lng | Float? | — | |
| ownerId | String | — | FK → User |
| availabilityCalendar | String? | — | JSON string of booked/unavailable dates |
| isActive | Boolean | true | Soft delete / deactivation |
| depositAmount | Float? | — | Override default calculated deposit |
| boostExpiresAt | DateTime? | — | Featured carousel boost expiry |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | updatedAt | |

Relations:
- `owner` → User (via ownerId)
- `rentals` → Rental[]

### Rental (`rentals`)
Booking/rental transactions between borrower and lender.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| itemId | String | — | FK → Item |
| borrowerId | String | — | FK → User (BorrowerRentals) |
| lenderId | String | — | FK → User (LenderRentals) |
| startDate | DateTime | — | |
| endDate | DateTime | — | |
| totalDays | Int | — | |
| rentalFee | Float | — | dailyRate * totalDays |
| platformFee | Float | — | Based on subscription tier |
| depositAmount | Float | — | |
| protectionFee | Float | 0 | Optional damage protection |
| deliveryFee | Float | 0 | |
| taxes | Float | — | 18% GST on taxable amount |
| totalPaid | Float | — | Sum of all fees |
| status | String | "PENDING" | Flow: PENDING → APPROVED → ACTIVE → COMPLETED / CANCELLED / DISPUTED |
| paymentId | String? | — | Razorpay payment reference |
| depositStatus | String? | — | |
| depositRefundAmount | Float? | — | |
| depositDeductionReason | String? | — | |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | updatedAt | |

### Payment (`payments`)
Razorpay payment records.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| rentalId | String | — | FK → Rental |
| razorpayOrderId | String? | — | |
| razorpayPaymentId | String? | — | |
| amount | Float | — | |
| type | String | — | Enum: rental / deposit / refund |
| status | String | "PENDING" | |
| capturedAt | DateTime? | — | |

### Payout (`payouts`)
Lender earnings payouts.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| rentalId | String | — | FK → Rental |
| lenderId | String | — | FK → User |
| amount | Float | — | rentalFee - platformCut |
| platformCut | Float | — | |
| status | String | "PENDING" | |
| scheduledAt | DateTime? | — | |
| paidAt | DateTime? | — | |

### Deposit (`deposits`)
Security deposit holds via Razorpay eMandate.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| rentalId | String | — | FK → Rental |
| amount | Float | — | |
| holdType | String | — | Enum: mandate / upi |
| mandateId | String? | — | Razorpay mandate ID |
| status | String | "HELD" | Enum: HELD / RELEASED / DEDUCTED |
| deductionAmount | Float? | — | |
| deductionReason | String? | — | |
| refundedAt | DateTime? | — | |

### Dispute (`disputes`)
Rental dispute records raised by either party.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| rentalId | String | — | FK → Rental |
| raisedById | String | — | FK → User (DisputeRaiser) |
| type | String | — | Enum: damage / return / late / other |
| status | String | "OPEN" | Enum: OPEN / UNDER_REVIEW / RESOLVED |
| description | String | — | |
| evidenceUrls | String | "[]" | JSON array of uploaded evidence image URLs |
| adminNotes | String? | — | |
| resolution | String? | — | |
| resolvedAt | DateTime? | — | |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | updatedAt | |

### Review (`reviews`)
Ratings and reviews between users after rental completion.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| rentalId | String | — | FK → Rental |
| reviewerId | String | — | FK → User (Reviewer relation) |
| revieweeId | String | — | FK → User (Reviewee relation) |
| rating | Int | — | 1-5 |
| comment | String? | — | |
| type | String | — | Enum: lender / borrower (who is being reviewed) |
| createdAt | DateTime | now() | |

### TrustEvent (`trust_events`)
Audit log for trust score changes.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| userId | String | — | FK → User |
| type | String | — | PHONE_VERIFIED / RENTAL_COMPLETED / RENTAL_CANCELLED / DISPUTE_LOST / etc. |
| delta | Int | — | Positive or negative score change |
| reason | String | — | Human-readable explanation |
| createdAt | DateTime | now() | |

### Subscription (`subscriptions`)
User subscription plans that affect platform fees and deposit multipliers.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| userId | String | — | **Unique**. FK → User (one-to-one) |
| plan | String | "FREE" | Enum: FREE / PLUS / PRO |
| status | String | "ACTIVE" | |
| razorpaySubId | String? | — | Razorpay subscription ID |
| currentPeriodEnd | DateTime? | — | |
| createdAt | DateTime | now() | |
| updatedAt | DateTime | updatedAt | |

### Notification (`notifications`)
In-app notifications.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| userId | String | — | FK → User |
| type | String | — | booking_request / booking_approved / payment_received / dispute_update / etc. |
| title | String | — | |
| body | String | — | |
| isRead | Boolean | false | |
| metadata | String? | — | JSON for extra context (rentalId, etc.) |
| createdAt | DateTime | now() | |

### OTP (`otps`)
One-time passwords for phone authentication.

| Field | Type | Default | Notes |
|---|---|---|---|
| id | String (cuid) | auto | PK |
| phone | String | — | |
| code | String | — | 6-digit OTP |
| expiresAt | DateTime | — | OTP expiry time |
| used | Boolean | false | |
| createdAt | DateTime | now() | |

### NextAuth Adapter Models

#### Account (`accounts`)
Links user accounts to OAuth/Credential providers.

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK → User (onDelete: Cascade) |
| type | String | |
| provider | String | e.g. "google", "phone" |
| providerAccountId | String | |
| refresh_token, access_token, expires_at, etc. | Optional | OAuth tokens |

Unique constraint: `[provider, providerAccountId]`

#### Session (`sessions`)
Database sessions (unused — JWT strategy used instead).

| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| sessionToken | String | Unique |
| userId | String | FK → User (onDelete: Cascade) |
| expires | DateTime | |

#### VerificationToken (`verification_tokens`)
Unused in current auth flow.

| Field | Type | Notes |
|---|---|---|
| identifier | String | |
| token | String | Unique |
| expires | DateTime | |

Unique constraint: `[identifier, token]`

### Prisma Client Singleton (`src/lib/prisma.ts`)
Uses the globalThis pattern to prevent multiple PrismaClient instances during hot reload:
```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

## Key Query Patterns
- Browse items: `Item.findMany({ where: { isActive: true }, include: { owner: true } })`
- User dashboard rentals: rentals grouped by status (ACTIVE, COMPLETED, PENDING)
- Lender earnings: sum of rentalFee for completed rentals grouped by lender
- Trust score: current value stored on User, history in TrustEvent[]
- Notifications: `Notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } })`
