'use client';

import { signOutEverywhere } from '@/lib/signout';
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
    // Broadcasts to peer tabs so they redirect at the same time, and
    // only clears the auth flag (not the whole sessionStorage).
    await signOutEverywhere({ broadcastReason: 'logged_out' });
  };

  return (
    <div onClick={handleLock}>
      <FingerprintButton />
    </div>
  );
}
