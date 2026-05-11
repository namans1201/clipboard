# CONTEXT.md — ClipClap (rebuilt each session)

**Session**: UI overhaul + neumorphic design system
**Date**: 2026-05-09

---

## Focus this session

Primary: Fix remaining UI issues from the neumorphic redesign.

1. **Dashboard background gradient** — needs a working implementation
2. **Visual QA** — verify all controls in a real logged-in browser session

---

## Files likely to be touched

- `src/app/(dashboard)/layout.tsx` — gradient fix
- `src/app/globals.css` — gradient classes or theme tokens
- `src/components/theme-toggle-dashboard.tsx` — sun/moon icon verify
- `src/components/compact-toggle.tsx` / `.module.css` — icon/color verify
- `src/components/lock-button.tsx` / `.module.css` — centering verify
- `src/components/new-clip-dialog.tsx` / `.module.css` — plus button verify

---

## Known Constraints

| Constraint | Reason |
|------------|--------|
| DO NOT touch `src/app/(auth)/login/` | User explicitly stated: do not modify auth/login page |
| DO NOT add `dashboard-main` className to layout.tsx main | Linter removes it; user explicitly said keep `<main className="flex-1 overflow-auto w-full">` only |
| CSS modules cannot use `background-image` | Tailwind v4 @tailwindcss/postcss rejects it with "Unknown word" error |
| layout.tsx must stay clean | Linter is aggressive about reverting changes |
| styled-components not in use | Package still listed but do not import it |

---

## Last Known Working State

- All core CRUD operations functional
- Auth (public + trusted device) working
- Sidebar, search, clip grid, dialogs all functional
- New clip dialog: neumorphic + button (just fixed nested button error)
- Theme toggle: sun/moon icons just swapped (unverified visually)
- Dashboard gradient: not applied (pending)

---

## Open Questions

1. What is the preferred approach for the dashboard background gradient, given the CSS module + linter constraints?
   - Option A: `style={{ backgroundImage: isDark ? '...' : '...' }}` inline in layout.tsx (requires useTheme import)
   - Option B: Tailwind arbitrary value `className="bg-[linear-gradient(...)]"` — but dark: variant may not work for gradient
   - Option C: CSS custom property on `:root` in globals.css, referenced in a Tailwind utility

2. Should the Supabase project be split into dev/prod environments?

3. Any new features planned before the next release?
