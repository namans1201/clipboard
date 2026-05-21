'use client';

import { LockButton } from '@/components/lock-button';
import { DashboardThemeToggle } from '@/components/theme-toggle-dashboard';
import styles from './top-right-controls.module.css';

/**
 * Top-right cluster: [Fingerprint Lock] [Day/Night Toggle].
 *
 * Rendered inside <main> with `position: absolute` so the cluster sits at
 * the top-right of the page content (vertically aligned with the search
 * bar) and scrolls up with the rest of the content. No JS scroll listener
 * is needed — natural scroll behaviour handles the "fade out when scrolling
 * down" effect by simply moving them out of view.
 */
export function TopRightControls() {
  return (
    <div className={styles.controls}>
      <LockButton />
      <DashboardThemeToggle />
    </div>
  );
}
