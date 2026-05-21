'use client';

import styles from './compact-toggle.module.css';

interface CompactToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/* Grid icon — 2×2 squares */
function GridIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgIcon}>
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

/* List icon — 3 rows with a dot + line each */
function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.svgIcon}>
      <circle cx="2.5" cy="4" r="1.5" fill="currentColor" />
      <rect x="5.5" y="3" width="9" height="2" rx="1" fill="currentColor" />
      <circle cx="2.5" cy="8" r="1.5" fill="currentColor" />
      <rect x="5.5" y="7" width="9" height="2" rx="1" fill="currentColor" />
      <circle cx="2.5" cy="12" r="1.5" fill="currentColor" />
      <rect x="5.5" y="11" width="9" height="2" rx="1" fill="currentColor" />
    </svg>
  );
}

export function CompactToggle({ checked, onChange }: CompactToggleProps) {
  return (
    <div
      className={styles.wrapper}
      title={checked ? 'Switch to grid view' : 'Switch to list view'}
    >
      <input
        className={styles.checkbox}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={checked ? 'Switch to grid view' : 'Switch to list view'}
      />
      <div className={styles.track}>
        <div className={`${styles.knob} ${checked ? styles.knobRight : ''}`}>
          {/* Grid icon: visible when NOT compact (checkbox unchecked) */}
          <span className={`${styles.iconWrap} ${!checked ? styles.iconVisible : styles.iconHidden}`}>
            <GridIcon />
          </span>
          {/* List icon: visible when compact (checkbox checked) */}
          <span className={`${styles.iconWrap} ${checked ? styles.iconVisible : styles.iconHidden}`}>
            <ListIcon />
          </span>
        </div>
      </div>
    </div>
  );
}
