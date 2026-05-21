/**
 * switchTheme — flips the theme without triggering hundreds of concurrent
 * CSS transitions across the DOM. The trick:
 *
 *   1. Add `theme-switching` to <html> (CSS rule in globals.css zeros out
 *      every transition-duration / animation-duration in the tree).
 *   2. Call setTheme — the colour change paints in a single frame.
 *   3. Remove the class on the next paint, so subsequent hover/focus
 *      transitions resume working normally.
 *
 * Without this, every element with `transition-colors` / `transition: all`
 * animates background-color/border-color/color for ~150ms when CSS
 * variables change — multiplied across the dashboard's clip cards (each
 * with backdrop-filter), this causes the visible lag.
 */
export function switchTheme(
  setTheme: (theme: string) => void,
  nextTheme: 'light' | 'dark',
) {
  if (typeof document === 'undefined') {
    setTheme(nextTheme);
    return;
  }

  const root = document.documentElement;
  root.classList.add('theme-switching');

  setTheme(nextTheme);

  // Two rAFs: one to let the theme class commit, a second to ensure the
  // single repaint with new tokens has flushed before we re-enable
  // transitions. Single rAF can still let some transitions sneak through
  // on slower devices.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-switching');
    });
  });
}
