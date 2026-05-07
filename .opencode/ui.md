# Grabbit - UI Component Library & Conventions

## Component Architecture

### Base UI Components (`src/components/ui/`)
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
| DateRangePicker | `date-range-picker.tsx` | react-aria-components |
| CarouselCard | `carousel-card.tsx` | Framer Motion |
| ThemeToggle | `theme-toggle.tsx` | next-themes, lucide-react |
| MultiStepForm | `multi-step-form.tsx` | framer-motion, cva, card, button, progress |
| SearchBar | `search-bar.tsx` | |
| TravelConnectSignIn | `travel-connect-signin.tsx` | |
| GlowyWavesHero | `glowy-waves-hero-shadcnui.tsx` | Landing page hero |

### Shared Components (`src/components/shared/`)
- `navbar.tsx` — App navbar with logo, nav links, theme toggle, user menu
- `trust-badge.tsx` — Color-coded trust score badge
- `skeleton.tsx` — Loading skeleton

## Styling Conventions

### Color Palette
- **Primary**: `#4F46E5` (indigo-600) — buttons, links, accents, active states
- **Background**: White (`#FFFFFF`) light / `#111827` (gray-900) dark
- **Surface**: `#F9FAFB` (gray-50) light / `#1F2937` (gray-800) dark
- **Text**: `#111827` (gray-900) light / `#F3F4F6` (gray-100) dark
- **Muted**: `#6B7280` (gray-500) light / `#9CA3AF` (gray-400) dark
- **Borders**: `#E5E7EB` (gray-200) light / `#374151` (gray-700) dark

### Tailwind Config
- Custom indigo palette (indigo-50 through indigo-950), primary = `#4F46E5`
- Dark mode: class strategy (`dark:` prefix)
- Custom animations: `fade-in`, `slide-up`, `scale-in`

### `cn()` utility (`src/lib/utils.ts`)
Combines `clsx` + `tailwind-merge` for conditional class merging.

### Dark Mode
- Applied via class on `<html>` element
- Toggled by `ThemeToggle` component using `next-themes`
- Convention: every color class has a corresponding `dark:` variant
- Components use `dark:bg-gray-900`, `dark:text-gray-100`, `dark:border-gray-700` etc.

### Common Patterns
- Cards: `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl`
- Inputs: `border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`
- Primary buttons: `bg-indigo-600 hover:bg-indigo-700 text-white`
- Gradient backgrounds: `bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-indigo-950`
- Muted text: `text-gray-500 dark:text-gray-400`
- Indigo accent: `text-indigo-600 dark:text-indigo-400`

## Layout Structure

### Root Layout
```
<Providers>          # SessionProvider, QueryClientProvider, Toaster
  <Navbar />          # Fixed top nav with logo, links, theme toggle
  <main>             # min-h-screen
    {children}
  </main>
</Providers>
```

### Page Patterns
- `page.tsx` — Server component (data fetching)
- Separate client component for interactive parts (e.g., `browse-content.tsx`, `item-detail-client.tsx`)
- Auth pages centered with `flex min-h-[80vh] items-center justify-center`

## Key Pages & Their Components

### Browse (`/browse`)
- `BrowseContent` — search input, category filter chips, featured carousel, item grid
- `ItemCard` — image, title, location, price, owner, trust badge, expandable "Read More" with full details
- `CarouselCard` — horizontal scroll of featured items

### List Item (`/list-item`)
- `MultiStepForm` — step indicator with progress bar, animated transitions
- Step 1: Category select, title, description, info alert
- Step 2: Daily/weekly rate (with AI suggest), item value, condition select
- Step 3: Location input + detect button, date range picker, photo upload with previews, deposit info box

### Item Detail (`/items/[id]`)
- Photo gallery, pricing breakdown, owner card, trust badge
- Booking calendar (DateRangePicker), rental summary, payment breakdown

## Animation
- Framer Motion for page transitions, multi-step form slides, carousel
- Tailwind `animate-fade-in` for expand/collapse elements
- `transition-all`, `hover:scale-105`, `group-hover:` patterns for interactivity
