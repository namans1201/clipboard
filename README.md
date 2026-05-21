# ClipClap

A personal clipboard manager web app — save, organise, search, and retrieve text snippets from any browser.

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router, Turbopack)
- **UI**: React 19 + TypeScript + Tailwind CSS v4
- **Component library**: shadcn/ui (base-ui) + custom neumorphic components
- **Database / Auth**: Supabase (PostgreSQL + RLS + Realtime + Email Auth)
- **Themes**: next-themes (light/dark with view-transition ripple)
- **Notifications**: Sonner toasts
- **Testing**: Playwright E2E
- **Deployment**: Vercel

## Local Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd clipboard
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Set up Supabase
# See SUPABASE_SETUP.md for full schema SQL

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

## Environment Variables

| Name | Required | Description | Example |
|------|----------|-------------|---------|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | Your Supabase project URL | https://xyz.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | Supabase anon/public key | eyJhbGci... |

## How to Run

```bash
npm run dev       # Development (Turbopack)
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint
npm run test:e2e  # Playwright E2E tests
```

## Folder Structure

```
src/
├── app/
│   ├── (auth)/login/       Login page
│   ├── (dashboard)/        Protected pages (/, /pinned, /trash, /group/[id])
│   ├── layout.tsx          Root layout (theme provider, fonts)
│   └── globals.css         Global styles + Tailwind v4 theme tokens
├── components/             UI components (clip cards, sidebar, dialogs, buttons)
│   └── ui/                 shadcn/base-ui primitives
├── hooks/                  Data fetching + business logic hooks
├── contexts/               React contexts (CompactContext)
├── lib/supabase/           Supabase client/server/middleware setup
└── types/database.ts       TypeScript types for DB entities
```

## Known Issues / Limitations

- Dashboard background gradient: CSS module approach conflicts with Tailwind v4 PostCSS — pending alternative implementation
- Supabase project is shared between development and production (no staging environment)
- No mobile app — browser only
