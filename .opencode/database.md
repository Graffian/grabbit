# Grabbit - Database Schema (SQLite via Prisma)

## Models

### User (`users`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| name | String? | |
| phone | String (unique) | Auth identifier for phone users |
| email | String? (unique) | From Google OAuth |
| avatar | String? | |
| city | String? | From onboarding |
| hearAboutUs | String? | Referral source (Google/Friend/Social Media/Other) |
| interests | String? | Comma-separated category interests |
| trustScore | Int (default: 50) | 0-100 |
| role | String (default: "USER") | "USER" or "ADMIN" |
| isVerified | Boolean (default: false) | |
| kycStatus | String (default: "NOT_SUBMITTED") | "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED" |
| stripeAccountId | String? | (unused, Razorpay used instead) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Relations: ownedItems, lentRentals, borrowedRentals, reviewsGiven, reviewsReceived, trustEvents, disputes, payouts, subscription, notifications, accounts, sessions

### Item (`items`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| title | String | |
| description | String | |
| category | String | |
| dailyRate | Float | |
| weeklyRate | Float? | |
| itemValue | Float | Used for deposit calc (20% min ₹200) |
| condition | String (default: "Good") | New/Like New/Good/Fair |
| images | String (JSON array) | Cloudinary URLs |
| location | String | City name |
| lat | Float? | |
| lng | Float? | |
| ownerId | String | FK → User |
| availabilityCalendar | String? | JSON string of unavailable dates |
| isActive | Boolean (default: true) | |
| depositAmount | Float? | Override default deposit |
| boostExpiresAt | DateTime? | Featured boost expiry |

### Rental (`rentals`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| itemId | String | FK → Item |
| borrowerId | String | FK → User (BorrowerRentals) |
| lenderId | String | FK → User (LenderRentals) |
| startDate | DateTime | |
| endDate | DateTime | |
| totalDays | Int | |
| rentalFee | Float | |
| platformFee | Float | Based on subscription tier |
| depositAmount | Float | |
| protectionFee | Float (default: 0) | |
| deliveryFee | Float (default: 0) | |
| taxes | Float | |
| totalPaid | Float | |
| status | String (default: "PENDING") | PENDING/APPROVED/ACTIVE/COMPLETED/CANCELLED/DISPUTED |
| paymentId | String? | |
| depositStatus | String? | |
| depositRefundAmount | Float? | |
| depositDeductionReason | String? | |

### Payment (`payments`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| rentalId | String | FK → Rental |
| razorpayOrderId | String? | |
| razorpayPaymentId | String? | |
| amount | Float | |
| type | String | rental/deposit/refund |
| status | String (default: "PENDING") | |
| capturedAt | DateTime? | |

### Payout (`payouts`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| rentalId | String | FK → Rental |
| lenderId | String | FK → User |
| amount | Float | |
| platformCut | Float | |
| status | String (default: "PENDING") | |
| scheduledAt | DateTime? | |
| paidAt | DateTime? | |

### Deposit (`deposits`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| rentalId | String | FK → Rental |
| amount | Float | |
| holdType | String | mandate/upi |
| mandateId | String? | Razorpay mandate ID |
| status | String (default: "HELD") | HELD/RELEASED/DEDUCTED |
| deductionAmount | Float? | |
| deductionReason | String? | |
| refundedAt | DateTime? | |

### Dispute (`disputes`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| rentalId | String | FK → Rental |
| raisedById | String | FK → User |
| type | String | damage/return/late/other |
| status | String (default: "OPEN") | OPEN/UNDER_REVIEW/RESOLVED |
| description | String | |
| evidenceUrls | String (JSON) | Uploaded evidence images |
| adminNotes | String? | |
| resolution | String? | |
| resolvedAt | DateTime? | |

### Review (`reviews`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| rentalId | String | FK → Rental |
| reviewerId | String | FK → User (Reviewer) |
| revieweeId | String | FK → User (Reviewee) |
| rating | Int | 1-5 |
| comment | String? | |
| type | String | lender/borrower |

### TrustEvent (`trust_events`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK → User |
| type | String | PHONE_VERIFIED/RENTAL_COMPLETED/RENTAL_CANCELLED/DISPUTE_LOST/etc |
| delta | Int | +/- trust score change |
| reason | String | |

### Subscription (`subscriptions`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId | String (unique) | FK → User |
| plan | String (default: "FREE") | FREE/PLUS/PRO |
| status | String (default: "ACTIVE") | |
| razorpaySubId | String? | |
| currentPeriodEnd | DateTime? | |

### Notification (`notifications`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| userId | String | FK → User |
| type | String | |
| title | String | |
| body | String | |
| isRead | Boolean (default: false) | |

### OTP (`otps`)
| Field | Type | Notes |
|---|---|---|
| id | String (cuid) | PK |
| phone | String | |
| code | String | 6-digit |
| expiresAt | DateTime | |
| used | Boolean (default: false) | |

### NextAuth models
- Account (`accounts`) — provider account linking
- Session (`sessions`) — database sessions (unused, using JWT)
- VerificationToken (`verification_tokens`) — unused

## Key Queries
- Browse items: `Item.findMany({ where: { isActive: true }, include: { owner: true } })`
- User dashboard: rentals grouped by status, items grouped by owner
- Earnings: sum of rentalFee for completed rentals grouped by lender
- Trust score: aggregate of TrustEvent deltas
