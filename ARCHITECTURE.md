# ARCHITECTURE.md — ClipClap

## System Overview

```
Browser (React 19 / Next.js 16 App Router)
        │
        ├── Auth check (middleware.ts)
        │       └── Validates Supabase session cookie on every request
        │           Redirects: unauthenticated → /login
        │                      authenticated   → / (away from /login)
        │
        ├── Public pages  → (auth) route group
        │       └── /login
        │
        └── Protected pages → (dashboard) route group
                ├── /            (all clips)
                ├── /pinned
                ├── /group/[id]
                └── /trash
```

## Data Flow

```
User action (e.g. "create clip")
        │
        ▼
React component calls hook (use-clips.ts)
        │
        ▼
Optimistic UI update (setState immediately)
        │
        ▼
Supabase JS SDK → supabase.from('clips').insert(...)
        │
        ├── Success → Realtime subscription fires → hook re-fetches / merges
        └── Failure → Rollback to previous state + toast error
```

## Auth Flow

```
1. User submits login form
2. supabase.auth.signInWithPassword() called
3. On success:
   - Trusted device: long-lived cookie (400 days), no expiry metadata
   - Public device:  sessionStorage flag set + user metadata updated with
                     public_session_expires_at = now + 15 min
4. middleware.ts checks cookie on every page load:
   - If expired (public device) → signs out → redirects to /login
5. use-session-heartbeat.ts polls every 60s:
   - Reads public_session_expires_at from user metadata
   - If past → forces sign-out + redirect
6. use-auto-lock.ts listens for mouse/keyboard activity:
   - 5 min inactivity on public device → handleLogout()
```

## Component Architecture

```
DashboardLayout
├── CompactProvider          (React context — grid/list state)
├── BlurOverlay              (blurs content on tab hide, public devices)
├── Sidebar
│   ├── CompactToggle        (grid/list switch, skeuomorphic)
│   ├── Nav links (All / Pinned)
│   ├── Groups list (dynamic)
│   └── TrashButton
├── <main>                   (route children)
│   └── HomePage / PinnedPage / GroupPage / TrashPage
│       ├── SearchBar        (neumorphic, animated icon)
│       ├── NewClipDialog    (neumorphic + button trigger)
│       └── ClipGrid
│           └── ClipCard × N (memoised)
│               └── ClipEditor (modal, opens on card click)
└── TopRightControls
    ├── LockButton           (fingerprint SVG, logout on click)
    └── DashboardThemeToggle (landscape image pill)
```

## Supabase Setup

```
Tables:
  clips   — RLS: user_id = auth.uid()
  groups  — RLS: user_id = auth.uid()

Realtime:
  clips table subscribed in use-clips.ts
  Re-fetches full list on any INSERT/UPDATE/DELETE event

Auth:
  Email/password only
  Session stored in cookie: "clipclap-auth"
  Public device flag in sessionStorage + user metadata
```

## Environment

| Environment | URL | Notes |
|-------------|-----|-------|
| Local dev | http://localhost:3000 | Turbopack HMR |
| Production | Vercel deployment | Edge middleware, static assets on CDN |
| Database | Supabase cloud | Single project, shared dev/prod |

## External Integrations

| Service | Purpose | SDK |
|---------|---------|-----|
| Supabase | PostgreSQL DB + Auth + Realtime | @supabase/supabase-js, @supabase/ssr |
