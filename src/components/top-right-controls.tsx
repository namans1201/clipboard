'use client';

import { LockButton } from '@/components/lock-button';
import { DashboardThemeToggle } from '@/components/theme-toggle-dashboard';
import styles from './top-right-controls.module.css';

/**
 * Fixed top-right cluster: [Fingerprint Lock] [Day/Night Toggle]
 * top offset is responsive (22px @ p-4, 30px @ sm:p-6) so the controls'
 * vertical centre aligns with the search bar's vertical centre on every page.
 */
export function TopRightControls() {
  return (
    <div className={styles.controls}>
      <LockButton />
      <DashboardThemeToggle />
    </div>
  );
}
