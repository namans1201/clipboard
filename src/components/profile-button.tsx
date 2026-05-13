'use client';

/**
 * ProfileButton — fixed bottom-right FAB on the login page.
 * Click → fetches /api/profile (cached) and shows the ProfileCard in a modal.
 * The button colour auto-adapts to light/dark via CSS variables.
 */

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ProfileCard, type ProfileData } from './profile-card';
import styles from './profile-button.module.css';

export function ProfileButton() {
  const [open, setOpen]         = useState(false);
  const [profile, setProfile]   = useState<ProfileData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => setMounted(true), []);

  const loadProfile = useCallback(async () => {
    if (profile || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as ProfileData;
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [profile, loading]);

  const handleOpen = () => {
    setOpen(true);
    loadProfile();
  };
  const handleClose = useCallback(() => setOpen(false), []);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  return (
    <>
      <button
        className={styles.fab}
        onClick={handleOpen}
        aria-label="View profile"
        title="About the developer"
        data-testid="profile-button"
        type="button"
      >
        {/* bi-person-fill, currentColor → picks up --main-color */}
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
        </svg>
      </button>

      {open && mounted && createPortal(
        <div
          className={styles.overlay}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Developer profile"
          data-testid="profile-modal"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close profile"
              type="button"
              data-testid="profile-close"
            >×</button>

            {loading && <div style={{ color: '#fff', padding: 40 }}>Loading…</div>}
            {error && (
              <div style={{ color: '#fff', padding: 40 }} role="alert">
                Failed to load profile: {error}
              </div>
            )}
            {profile && <ProfileCard profile={profile} />}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
