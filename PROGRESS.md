# PROGRESS.md — ClipClap

**Last updated**: 2026-05-09 | Session: UI overhaul + neumorphic design system

---

## What is fully working ✅

### Core Features
- Email/password authentication (login/logout)
- Public device mode: 15-min session, 5-min auto-lock, screen blur on tab switch, session heartbeat
- Trusted device mode: persistent 400-day login
- Panic lock button (fingerprint SVG with draw animation)
- Create, read, update, delete clips
- Copy to clipboard
- Pin/unpin clips
- Soft delete + trash view (clips + groups tabs)
- Restore from trash
- Permanent delete
- Real-time sync via Supabase subscriptions
- Optimistic updates with rollback on error

### Groups
- Create, rename, soft delete, restore, permanent delete groups
- Clips in deleted group become ungrouped (ON DELETE SET NULL)
- Duplicate group name prevention (case-insensitive)

### Visitor / About
- ProfileButton FAB at bottom-right of login page → opens a modal with the developer profile card (avatar, name, socials)
- Theme-aware colours (white/dark-navy bg, dark/light text & border) via CSS custom properties
- `/api/profile` public GET endpoint with schema validation and cache headers
- Closes on Esc, overlay click, or × button
- 6 Playwright tests covering API, visibility, open/close, modal lifecycle

### UI
- Neumorphic design across light + dark mode
- Day/night theme toggle (landscape image pill, skeuomorphic)
- Fingerprint logout button (49px circle, SVG draw animation on hover)
- Neumorphic search bar with animated magnifying glass icon
- Neumorphic + button (circle) for new clip creation
- Grid/list compact toggle with embedded SVG icons (grid ↔ list)
- Responsive sidebar with hamburger menu (mobile)
- CompactToggle in sidebar header; lock+theme in fixed top-right cluster
- Dashboard spinning ball loader
- Skeleton loading states for clip cards
- Sonner toast notifications
- View-transition ripple effect on theme switch (login page)

### Architecture
- All icons vertically aligned (responsive top offset via CSS media query in top-right-controls.module.css)
- CompactContext shared between sidebar and all dashboard pages
- CSS Modules for all custom component styles (no styled-components SSR issues)

---

## What is broken or incomplete 🔧

| Issue | File(s) | Notes |
|-------|---------|-------|
| Dashboard background gradient not applied | `src/app/(dashboard)/layout.tsx`, `src/app/globals.css` | CSS module approach rejected by Tailwind v4 PostCSS; globals.css class reverted by linter |
| Sun/moon icon logic just swapped | `src/components/theme-toggle-dashboard.tsx` | Verify visually once logged in |
| `styled-components` still in package.json | `package.json` | Not used in code anymore; safe to remove |

---

## Current Blockers

- None blocking core functionality
- Dashboard gradient: needs a working approach that survives the linter + PostCSS pipeline

---

## Next Session Priorities

1. Fix dashboard background gradient (try inline style approach with useTheme hook)
2. Visual QA pass after logging in: verify all icon alignments, toggle behavior, gradient
3. Remove `styled-components` dependency (unused)
4. Consider adding the gradient to the body/html in globals.css under a `.dashboard` wrapper class on the layout
5. E2E test coverage for new UI interactions

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-09 | Moved all styling to CSS Modules | styled-components caused SSR hydration mismatches |
| 2026-05-09 | CompactToggle moved to sidebar header | Better UX placement; lock+theme go to top-right fixed cluster |
| 2026-05-09 | TopRightControls uses responsive CSS top offset | Aligns controls with search bar at both p-4 and sm:p-6 breakpoints |
| 2026-05-09 | Dashboard gradient via globals.css | CSS modules rejected by Tailwind v4 @tailwindcss/postcss for background-image |
| 2026-05-09 | Reverted gradient | Linter removed dashboard-main class from layout.tsx; left as-is per user instruction |
