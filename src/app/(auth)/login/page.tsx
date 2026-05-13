'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { createClient, resetClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { ProfileButton } from '@/components/profile-button';
import styles from './login.module.css';

const PUBLIC_DEVICE_SESSION_DURATION_MS = 15 * 60 * 1000;

/* Extend Document type for View Transition API */
type DocWithVT = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

function SessionExpiredNotice() {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('reason') === 'session_expired') {
      toast.warning('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);
  return null;
}

export default function LoginPage() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [isPublicDevice, setIsPublicDevice] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [mounted, setMounted]           = useState(false);
  const router                          = useRouter();
  const { resolvedTheme, setTheme }     = useTheme();

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  /* Moon/sun toggle with View Transition ripple */
  const handleThemeToggle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextDark = e.target.checked;
      const label    = (e.currentTarget as HTMLElement).closest('label');
      let x = window.innerWidth  / 2;
      let y = window.innerHeight / 2;
      if (label) {
        const r = label.getBoundingClientRect();
        x = r.left + r.width  / 2;
        y = r.top  + r.height / 2;
      }
      const apply = () => setTheme(nextDark ? 'dark' : 'light');
      const doc   = document as DocWithVT;
      if (!doc.startViewTransition) { apply(); return; }
      const vt = doc.startViewTransition(apply);
      vt.ready.then(() => {
        document.documentElement.style.setProperty('--x', `${x}px`);
        document.documentElement.style.setProperty('--y', `${y}px`);
      });
    },
    [setTheme],
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isPublicDevice) {
        sessionStorage.setItem('is_public_device', 'true');
      } else {
        sessionStorage.removeItem('is_public_device');
      }
      resetClient();
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await supabase.auth.updateUser({
        data: isPublicDevice
          ? { is_public_device: true,  public_session_expires_at: Date.now() + PUBLIC_DEVICE_SESSION_DURATION_MS }
          : { is_public_device: false, public_session_expires_at: null },
      });
      toast.success('Logged in successfully!');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Suspense fallback={null}>
        <SessionExpiredNotice />
      </Suspense>

      {/* ── Moon / Sun theme toggle ── */}
      <label className={styles.moonToggle} aria-label="Toggle theme">
        {mounted && (
          <input
            type="checkbox"
            checked={isDark}
            onChange={handleThemeToggle}
          />
        )}
        <div />
      </label>

      {/* ── Hero title ── */}
      <div className={styles.titleBlock}>
        <hr className={styles.titleHr} />
        <section className={styles.titleSection}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
          <h1>
            <strong>Clip:</strong><span>:Clap</span>
          </h1>
        </section>
        <hr className={styles.titleHr} />
      </div>

      {/* ── Login card ── */}
      <div className={styles.cardWrapper}>
        <div className={styles.flipCardFront}>
          <div className={styles.cardTitle}>Log in</div>
          <form className={styles.flipCardForm} onSubmit={handleLogin}>
            <input
              className={styles.flipCardInput}
              name="email"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={styles.flipCardInput}
              name="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className={styles.publicDevice}>
              <label className={styles.glCheckbox}>
                <input
                  className={styles.glCheckboxInput}
                  type="checkbox"
                  checked={isPublicDevice}
                  onChange={(e) => setIsPublicDevice(e.target.checked)}
                />
                <span className={styles.glCheckboxBox}>
                  <svg
                    className={styles.glCheckboxCheck}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className={styles.glCheckboxLabel}>
                  <Lock size={13} className={styles.lockIcon} />
                  Public/Shared Device
                </span>
              </label>
              <p className={styles.deviceHint}>Auto-expires after 15 min &amp; tab close</p>
            </div>

            <button className={styles.flipCardBtn} type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : "Let's go!"}
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom-right profile FAB → opens developer profile card ── */}
      <ProfileButton />
    </div>
  );
}
