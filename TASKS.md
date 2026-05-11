# TASKS.md — ClipClap

## In Progress 🔧

- [ ] Fix dashboard background gradient
      Owner: agent
      Files affected: src/app/(dashboard)/layout.tsx, src/app/globals.css OR inline style in layout
      Notes: Tailwind v4 PostCSS rejects background-image in CSS modules. Linter removes non-Tailwind classNames. Try: (a) inline style with useTheme(), or (b) Tailwind arbitrary value bg-[linear-gradient(...)] with dark: variant

---

## Backlog ❌

- [ ] Remove unused styled-components dependency
      Owner: agent
      Files affected: package.json
      Notes: No longer used in any component; safe to npm uninstall

- [ ] Visual QA pass (logged-in session)
      Owner: human + agent
      Files affected: all dashboard pages
      Notes: Verify icon alignment, gradient, toggle icons, compact toggle colors, lock button centering

- [ ] Add staging/preview Supabase project
      Owner: human
      Notes: Currently dev and prod share the same Supabase project — risky

- [ ] Mobile UX testing
      Owner: human
      Notes: Responsive sidebar exists; needs real-device testing

- [ ] Search debouncing
      Owner: agent
      Files affected: src/app/(dashboard)/page.tsx, src/components/search-bar.tsx
      Notes: Currently fires on every keystroke; add 200ms debounce

---

## Done ✅ (last 10)

- [x] Fix nested `<button>` hydration error in NewClipDialog (asChild → direct className)
- [x] Swap sun/moon icons in theme toggle (was reversed)
- [x] Align all top-bar icons to same horizontal baseline (responsive top offset)
- [x] Replace SVG + button with neumorphic circle + button (NewClipDialog trigger)
- [x] Fix fingerprint lock button SVG centering (viewBox extended to contain all paths)
- [x] Compact toggle: match day/night toggle color palette (dark navy ↔ cream)
- [x] Compact toggle: embed grid/list SVG icons in knob
- [x] TrashButton instant reaction (transition: all 0s)
- [x] Lock button size: 49px circle matching theme toggle height; removed LED glow dot
- [x] Dashboard gradient (CSS in globals.css — reverted per user request)
