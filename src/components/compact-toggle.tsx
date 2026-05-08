'use client';

import styles from './compact-toggle.module.css';

interface CompactToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CompactToggle({ checked, onChange }: CompactToggleProps) {
  return (
    <div
      className={styles.wrapper}
      title={checked ? 'Switch to grid view' : 'Switch to list view'}
    >
      <div className={styles.checkbox}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={checked ? 'Switch to grid view' : 'Switch to list view'}
        />
      </div>
    </div>
  );
}
