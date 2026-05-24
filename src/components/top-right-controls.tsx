'use client';

import { DashboardThemeToggle } from '@/components/theme-toggle-dashboard';
import styles from './top-right-controls.module.css';

/**
 * Top-right cluster — now contains only the wide day/night theme toggle.
 * The fingerprint LockButton was moved into the sidebar (bottom row) so
 * mobile users can reach it without depending on TopRightControls.
 *
 * Rendered inside <main> with `position: absolute` so the cluster sits at
 * the top-right of the page content (vertically aligned with the search
 * bar) and scrolls up with the rest of the content.
 */
export function TopRightControls() {
  return (
    <div className={styles.controls}>
      <DashboardThemeToggle />
    </div>
  );
}
