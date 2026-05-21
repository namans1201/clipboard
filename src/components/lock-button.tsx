'use client';

import { clearAuthCookies, createClient, resetClient } from '@/lib/supabase/client';
import FingerprintButton from './fingerprint-button';

/**
 * LockButton — wraps the visual FingerprintButton with the dashboard's
 * logout action. The inner <button> has no onClick of its own; the click
 * bubbles up to this wrapping div, which fires the supabase sign-out and
 * redirects to /login. Keyboard `Enter` on the focused inner button also
 * fires a synthetic click that bubbles, so keyboard users are covered.
 *
 * All visual styling, sizing (49px), animation, and theme handling now
 * live inside FingerprintButton — no CSS overrides at this layer.
 */
export function LockButton() {
  const handleLock = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } finally {
      clearAuthCookies();
      resetClient();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div onClick={handleLock}>
      <FingerprintButton />
    </div>
  );
}
