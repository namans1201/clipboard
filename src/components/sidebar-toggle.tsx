'use client';

import styles from './sidebar-toggle.module.css';

/**
 * SidebarToggle — neomorphic open/close button anchored to the right edge of
 * the desktop sidebar. Unchecked: 3 horizontal bars (sidebar open).
 * Checked: arrow → (sidebar collapsed, click to expand).
 */
export function SidebarToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={styles.neoButton}
      data-collapsed={collapsed}
      aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
      title={collapsed ? 'Open sidebar' : 'Close sidebar'}
    >
      <input
        type="checkbox"
        checked={collapsed}
        onChange={onToggle}
        aria-hidden="true"
      />
      <span />
      <span />
      <span />
    </label>
  );
}
