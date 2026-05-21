# SPEC.md — ClipClap

## Project Goal
ClipClap is a personal clipboard manager web app that lets users save, organise, search, and retrieve text snippets (clips) from any device. It supports two device trust modes — public (short-lived sessions, auto-lock, screen blur) and trusted (persistent sessions) — and organises clips into custom groups with pinning and soft-delete/trash.

## User Roles
| Role | Description |
|------|-------------|
| Authenticated User | Single user type. Owns all their clips and groups. All data is user-scoped via Supabase RLS. |

## Features

### Visitor / About
| Feature | Status |
|---------|--------|
| Profile-card popup on login page (bottom-right FAB → modal w/ avatar, name, socials; theme-aware colours; closes on Esc / overlay click / × button) | ✅ done |
| `GET /api/profile` public endpoint (validation + cache headers; no auth) | ✅ done |

### Auth & Session
| Feature | Status |
|---------|--------|
| Email/password login | ✅ done |
| Public device mode (15-min session, auto-lock 5 min, screen blur) | ✅ done |
| Trusted device mode (400-day persistent session) | ✅ done |
| Auto-lock on inactivity (public devices only) | ✅ done |
| Session heartbeat validation every 60s | ✅ done |
| Screen blur on tab visibility change | ✅ done |
| Panic lock button (instant logout) | ✅ done |
| View-transition ripple on theme change | ✅ done |

### Clip Management
| Feature | Status |
|---------|--------|
| Create clip (content + optional title + optional group) | ✅ done |
| View all clips (grid or list layout) | ✅ done |
| Edit clip (content, title, group, pin) | ✅ done |
| Copy clip to clipboard | ✅ done |
| Pin / unpin clip | ✅ done |
| Soft delete (move to trash) | ✅ done |
| Restore from trash | ✅ done |
| Permanent delete | ✅ done |
| Real-time sync (Supabase realtime subscriptions) | ✅ done |
| Optimistic updates with rollback | ✅ done |
| Paste from clipboard button in new-clip dialog | ✅ done |
| Fullscreen editor mode | ✅ done |
| Enter-to-save (Shift+Enter for newline) | ✅ done |

### Groups
| Feature | Status |
|---------|--------|
| Create group | ✅ done |
| View clips by group | ✅ done |
| Rename group | ✅ done |
| Delete group (soft delete; clips move to ungrouped) | ✅ done |
| Restore group from trash | ✅ done |
| Permanent delete group | ✅ done |
| Duplicate name prevention (case-insensitive) | ✅ done |

### Search & Filter
| Feature | Status |
|---------|--------|
| Full-text search (title + content) | ✅ done |
| Filter by group (via sidebar) | ✅ done |
| Filter pinned clips | ✅ done |
| Filter deleted clips (trash view) | ✅ done |

### UI / UX
| Feature | Status |
|---------|--------|
| Neumorphic design system (light + dark) | ✅ done |
| Day/night theme toggle (landscape image pill) | ✅ done |
| Responsive sidebar with hamburger menu | ✅ done |
| Grid / list compact toggle with icons | ✅ done |
| Neumorphic search bar with animated icon | ✅ done |
| Spinning ball dashboard loader | ✅ done |
| Fingerprint lock button (SVG draw animation) | ✅ done |
| Neumorphic + button for new clip | ✅ done |
| Dashboard background gradient (light / dark) | ❌ not working — CSS module PostCSS conflict, pending fix |
| Skeleton loading states | ✅ done |
| Toast notifications (Sonner) | ✅ done |

## Data Models

### Clip
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, RLS enforced |
| content | text | Required |
| title | text \| null | Optional label |
| is_pinned | boolean | Default false |
| is_deleted | boolean | Soft delete flag |
| group_id | uuid \| null | FK → groups (ON DELETE SET NULL) |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-updated |

### Group
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → auth.users, RLS enforced |
| name | text | Unique per user (enforced in hook) |
| is_deleted | boolean | Soft delete flag |
| created_at | timestamptz | Auto-set |

## API Contracts

| Method | Path | Auth | Response | Notes |
|--------|------|------|----------|-------|
| GET | `/api/profile` | No (public) | `{ name, tagline, avatar, socials: { website?, github?, linkedin? } }` | Visitor profile shown on login page. Validation on every read; cached `s-maxage=3600`. |

All other data access goes through the Supabase JS SDK directly from the browser, protected by Row Level Security (RLS) policies on each table.

## Frontend Pages
| Path | Component | Auth Required | Status |
|------|-----------|---------------|--------|
| /login | LoginPage | No (redirects away if authed) | ✅ done |
| / | HomePage | Yes | ✅ done |
| /pinned | PinnedPage | Yes | ✅ done |
| /trash | TrashPage | Yes | ✅ done |
| /group/[id] | GroupPage | Yes | ✅ done |

## Non-Functional Requirements
- **Security**: All DB queries behind Supabase RLS; cookies scoped per device trust level; session metadata stored in Supabase user metadata
- **Performance**: Optimistic updates; memoised ClipGrid; Turbopack dev server; image optimization (AVIF/WebP)
- **Accessibility**: All interactive controls have aria-labels; keyboard-navigable dialogs
- **Testing**: Playwright E2E test suite (see TESTING.md)
