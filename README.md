# Clipboard Easy

A lightweight, multi-device clipboard web app for securely storing and organizing text snippets, code, and notes.

## Features

- **Multi-device Access**: Access your clips from any device
- **Groups/Sections**: Organize clips into custom groups (e.g., "Datastack")
- **Pin Important Clips**: Keep frequently used clips at the top
- **Trash & Restore**: Soft delete with recovery option
- **Dual-Mode Security**:
  - **Trusted Device**: Persistent login for personal devices
  - **Public Device**: Auto-expiring sessions, blur on tab switch, panic lock button
- **Content Preservation**: Stores text exactly as copied (code, JSON, markdown)
- **Lightweight**: Built with Next.js 14, Shadcn/ui, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel (recommended)

## Getting Started

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Go to Authentication > Providers and ensure Email is enabled
4. Create a user in Authentication > Users (this will be your single user)

### 2. Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Find these in your Supabase project: Settings > API

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Security Features

### Public Device Mode
When logging in from a shared/public device:
- Check "This is a public/shared device"
- Session stored in memory only (not localStorage)
- Auto-logout after 5 minutes of inactivity
- Screen blurs when tab is not active
- Use "Lock & Logout" button for instant session termination

### Trusted Device Mode
For personal devices:
- Persistent login session
- Session stored in localStorage
- No auto-lock timeout

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/      # Login page
│   ├── (dashboard)/       # Main app pages
│   │   ├── page.tsx       # Home (all clips)
│   │   ├── pinned/        # Pinned clips
│   │   ├── trash/         # Trash
│   │   └── group/[id]/    # Group view
├── components/            # UI components
├── hooks/                 # Custom React hooks
├── lib/supabase/          # Supabase client config
└── types/                 # TypeScript types
```

## License

MIT
