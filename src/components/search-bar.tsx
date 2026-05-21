'use client';

import { useState } from 'react';
import styles from './search-bar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search Clips',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const isActive = isFocused || value.length > 0;

  return (
    <div className={styles.container}>
      <div className={`${styles.finder}${isActive ? ` ${styles.active}` : ''}`}>
        <div className={styles.finderOuter}>
          <div className={styles.finderInner}>
            <div className={styles.finderIcon} />
            <input
              className={styles.finderInput}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
