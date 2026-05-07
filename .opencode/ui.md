# Grabbit - UI Component Library & Conventions

## Base UI Components (`src/components/ui/`)
Custom shadcn/ui-style components built on Radix UI primitives:

| Component | File | Dependencies |
|---|---|---|
| Button | `button.tsx` | cva, lucide-react (Slot) |
| Card | `card.tsx` | cva |
| Input | `input.tsx` | cva |
| Label | `label.tsx` | @radix-ui/react-label |
| Alert | `alert.tsx` | cva — variants: default, warning, error, success, info |
| Select | `select.tsx` | Radix select primitives |
| DropdownMenu | `dropdown-menu.tsx` | Radix dropdown menu |
| Progress | `progress.tsx` | Radix progress |
| Separator | `separator.tsx` | Radix separator |
| ScrollArea | `scroll-area.tsx` | Radix scroll-area |
| Tooltip | `tooltip.tsx` | Radix tooltip |
| DateRangePicker | `date-range-picker.tsx` | react-aria-components (DateRangePicker, RangeCalendar, CalendarCell, DateInput, DateSegment, Popover, Dialog, Group, Heading) |
| CarouselCard | `carousel-card.tsx` | Framer Motion |
| ThemeToggle | `theme-toggle.tsx` | next-themes (useTheme), lucide-react (Sun, Moon) |
| MultiStepForm | `multi-step-form.tsx` | framer-motion (AnimatePresence, motion), cva, card, button, progress, lucide-react (X) |
| SearchBar | `search-bar.tsx` | |
| TravelConnectSignIn | `travel-connect-signin.tsx` | Google sign-in + phone option card |
| GlowyWavesHero | `glowy-waves-hero-shadcnui.tsx` | Landing page hero with animated waves and CTA |

### Shared Components (`src/components/shared/`)
- `navbar.tsx` — App navbar:
  - Hidden on routes: `/`, `/login`, `/onboarding`, `/kyc`
  - Sticky top, z-50, gradient bg with backdrop-blur, border-b indigo-200/70
  - Desktop: logo (Package icon in indigo gradient box + "Grabbit") → Browse link → List Item (auth) → Dashboard (auth) → Bell icon (notifications, auth) → ThemeToggle (manual class toggle on `<html>`, Sun/Moon icons) → user name + Sign Out button (auth) / Sign In button (anon)
  - Mobile: hamburger → slide-up nav with Browse, List Item (auth), Dashboard (auth), Sign Out (auth) / Sign In (anon)
  - Active link: indigo-600 bg-indigo-50; inactive: gray-600 hover indigo-600
- `trust-badge.tsx` — Color-coded trust score badge: ≤40 "New User" gray, ≤60 "Trusted" blue, ≤80 "Reliable" green, >80 "Elite" yellow
- `skeleton.tsx` — Loading skeleton placeholder

## Globals & CSS Custom Properties (`src/app/globals.css`)

### CSS Variables (HSL)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 243 75% 59%;        /* #4F46E5 */
  --primary-foreground: 0 0% 100%;
  --border: 214.3 31.8% 91.4%;
  --ring: 243 75% 59%;
  --radius: 0.5rem;
}
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 243 75% 59%;
  --border: 217.2 32.6% 17.5%;
}
```

### Base styles
- `* { @apply border-border; }` — all elements use border color from CSS variable
- `body { @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100; }`

## Tailwind Config (`tailwind.config.ts`)
- Dark mode: `"class"` strategy
- Container: centered, 2rem padding, max 1400px
- Custom colors: primary (50-900 with 600=#4F46E5), border, input, ring, background, foreground, muted, accent, destructive (all mapped to CSS variables)
- Custom animations:
  - `fade-in` — opacity 0→1, 0.3s ease-in-out
  - `slide-up` — opacity 0 + translateY(10px) → opacity 1 + translateY(0), 0.3s ease-out
- Plugins: `tailwindcss-animate`

## Color Palette
- **Primary**: `#4F46E5` (indigo-600) — buttons, links, accents, active states, focus rings
- **Background**: White (`#FFFFFF`) light / `#030712` (gray-950) dark
- **Surface/card**: `#FFFFFF` light / `#111827` (gray-900) dark
- **Text**: `#111827` (gray-900) light / `#F3F4F6` (gray-100) dark
- **Muted text**: `#6B7280` (gray-500) light / `#9CA3AF` (gray-400) dark
- **Borders**: `#E5E7EB` (gray-200) light / `#374151` (gray-700) dark
- **Hover surfaces**: `#F9FAFB` (gray-50) light / `#1F2937` (gray-800) dark

### Dark Mode Convention
Every color class must have a corresponding `dark:` variant:
- `bg-white dark:bg-gray-900` — cards, inputs, dropdowns
- `text-gray-900 dark:text-gray-100` — primary text
- `text-gray-500 dark:text-gray-400` — muted/secondary text
- `border-gray-200 dark:border-gray-700` — borders
- `bg-gray-50 dark:bg-gray-800` — subtle backgrounds, hover states
- `bg-indigo-50 dark:bg-indigo-900/30` — indigo accent backgrounds
- `text-indigo-600 dark:text-indigo-400` — indigo accent text

### Common Patterns
- Cards: `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl`
- Inputs: `border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`
- Primary buttons: `bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25`
- Outline buttons: `border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400`
- Gradient backgrounds: `bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-indigo-950`
- Alert info: `border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300`

## Layout Structure

### Root Layout (`src/app/layout.tsx`)
```
<Providers>              # SessionProvider → QueryClientProvider → Toaster
  <Navbar />             # Fixed top nav
  <main class="min-h-screen">
    {children}
  </main>
</Providers>
```
- Font: Inter (Google Fonts)
- Razorpay checkout script loaded lazily
- Navbar present on all pages

### Page Patterns
- `page.tsx` — Server component for data fetching when possible
- Separate client component for interactive parts (e.g., `browse-content.tsx`, `item-detail-client.tsx`, `borrower-dashboard.tsx`, `lender-dashboard.tsx`, `admin-dashboard.tsx`, `dispute-detail.tsx`)
- Auth pages centered with `flex min-h-[80vh] items-center justify-center px-4`
- Dashboard pages use card-based layouts with status badges

## Key Pages & Their Components

### Browse (`/browse`)
- `BrowseContent` (client) — profile section, search input, category filter chips (animated show/hide), featured carousel, "Near you" section, all-items grid
- `ItemCard` — image (4:3 aspect), title, condition badge, location with MapPin icon, price with /day, owner name + TrustBadge, expandable "Read More" toggle
- Expandable card section: description, 2x2 rates grid (daily, weekly with discount %, category, condition), owner info card (listed by, distance, trust score), "View Full Details" button
- `CarouselCard` (client) — horizontal scroll with Framer Motion drag, pagination dots, featured/hardcoded items

### List Item (`/list-item`)
- Multi-step form with animated transitions (Framer Motion spring)
- Progress bar + "Step X of 3" indicator
- Step 1: Category dropdown (from CATEGORY_RATES), title input, textarea description, info alert
- Step 2: Daily rate (with Sparkles AI-suggest button), weekly rate, item value (with deposit explanation), condition dropdown
- Step 3: Location input + Detect (geolocation → Nominatim reverse geocode), DateRangePickerComponent, photo upload (drag zone, max 10, Cloudinary), image preview grid with delete, warning alert if <2 photos, deposit info box

### Item Detail (`/items/[id]`)
- Server component `page.tsx` — fetches item with owner + active rentals (for disabled dates), `dynamic = "force-dynamic"`, parses images JSON string
- Client component `item-detail-client.tsx`:
  - Image gallery: 16:9 aspect, prev/next arrows, image counter badge
  - Item header: category badge (indigo), condition badge (gray), title, location with MapPin
  - Description section
  - Sidebar (lg:col-span-2):
    - Price card: daily rate (large) + weekly rate if available
    - Date picker: **react-day-picker v9** (`DayPicker` with `mode="range"`), disabled dates from existing rentals, indigo styling
    - Fee breakdown: rentalFee, platformFee (with %), refundable deposit (green), tax (18%), totalPayable
    - Protection Plan: none/basic/premium (₹0/₹49/₹99) toggle buttons
    - Delivery: ₹79 toggle pill button
    - "Rent Now" button → triggers payment flow (booking → Razorpay order → checkout → verification)
  - Owner card: avatar initial, name, city, TrustBadge

### Dashboards (`/dashboard/borrower`, `/dashboard/lender`)
- Borrower: active rentals (countdown timers, status badges: PENDING/APPROVED/ACTIVE), returned rentals history table
- Lender: listed items + stats (times rented, total earned), active rentals, earnings summary (total earned, pending payouts), incoming rental requests (approve/decline buttons)
- Admin (`/admin`): KYC submissions table (approve/reject), disputes management (resolve)

### Other Pages
- Notifications (`/notifications`): list of in-app notifications with read/unread styling, timestamps
- Pricing (`/pricing`): three-column subscription comparison (Free/Plus/Pro), feature list, CTA buttons
- KYC (`/kyc`): document upload form (Aadhar, PAN, etc.), status display

### Landing Page (`/`)
- Client component wrapping `GlowyWavesHero` with onLogin/onSignup both pointing to `/login`
- `GlowyWavesHero` (`src/components/ui/glowy-waves-hero-shadcnui.tsx`) — animated SVG wave background, tagline CTA, Login/Signup buttons
- Navbar hidden on this route

### Login / Sign-In (`/login`)
- Uses `TravelConnectSignIn` component (`src/components/ui/travel-connect-signin.tsx`):
  - Two-column layout: left (hidden on mobile) has indigo gradient bg with animated dot map canvas (Framer Motion, canvas drawing with route animations), Grabbit branding; right has the sign-in form
  - Google sign-in button (SVG icon, indigo border, hover effects)
  - "or" divider with indigo line
  - Phone sign-in button (indigo-600 filled)
  - Terms & Privacy Policy links at bottom
  - Animated entrance: scale + fade on card, slide-up on form elements
- Phone flow (in-page, not TravelConnectSignIn):
  - Back button → phone input (indigo tint, centered, max 10 digits) → "Send OTP" → OTP input (centered, 6-digit, tracking-widest, 2xl text) → "Verify & Sign In" → change number link

## External Dependencies

### Icon Library
- **Lucide React** — all icons (MapPin, Search, User, Package, ChevronDown, ChevronUp, Navigation, Camera, Upload, X, Sparkles, Info, AlertTriangle, Clock, CalendarIcon, SlidersHorizontal, Sun, Moon, etc.)

### Animation
- **Framer Motion v12** — page transitions, multi-step form slides (spring animation, AnimatePresence), carousel drag scroll
- **Tailwind custom animations** — `animate-fade-in` for expand/collapse, `animate-slide-up` for entrance
- CSS transitions — `transition-all`, `hover:scale-105`, `group-hover:scale-105`, `group-hover:opacity-100` for interactive elements

### Forms & Date Handling
- `react-aria-components` — DateRangePicker, RangeCalendar, CalendarCell, DateInput, DateSegment, Popover, Dialog
- `@internationalized/date` — getLocalTimeZone, today
- `date-fns v4` — date formatting (used in item detail / dashboards)
- `react-day-picker v9` — alternative date picker (used in item detail)
