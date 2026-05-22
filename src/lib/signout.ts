'use client';

import { clearAuthCookies, createClient, resetClient } from '@/lib/supabase/client';

/**
 * Centralised sign-out. Used by:
 *   - lock-button.tsx (manual fingerprint lock)
 *   - sidebar.tsx (legacy sidebar lock)
 *   - use-auto-lock (idle timer)
 *   - use-session-heartbeat (server-side expiry)
 *
 * Three jobs:
 *   1. Tear down this tab's Supabase session (server-side invalidate +
 *      cookie + in-memory client).
 *   2. Broadcast to other tabs in the SAME browser so they redirect to
 *      /login at the same time. Without this, peer tabs sit on the dashboard
 *      until their next request hits middleware.
 *   3. Redirect this tab to /login.
 *
 * `sessionStorage.clear()` was previously called here — that wiped every
 * app key, including unrelated UI state. Replaced with a targeted remove
 * of the legacy `is_public_device` flag (kept for backwards-compatibility
 * with any old tab still reading sessionStorage; the authoritative source
 * is the public.user_sessions table now).
 */

const CHANNEL_NAME = 'clipclap-auth';
const SIGNOUT_KEY  = 'is_public_device';

type AuthMessage = { type: 'signout'; reason?: string };

/**
 * Listen for sign-out broadcasts from peer tabs. Call once at app startup
 * (the dashboard layout is the natural mount point). When another tab
 * signs out we reload `/login` so this tab catches up.
 */
export function subscribeToSignoutBroadcasts(reason: string = 'session_expired') {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return () => {};
  }
  const ch = new BroadcastChannel(CHANNEL_NAME);
  ch.addEventListener('message', (event: MessageEvent<AuthMessage>) => {
    if (event.data?.type === 'signout') {
      window.location.href = `/login?reason=${event.data.reason ?? reason}`;
    }
  });
  return () => ch.close();
}

/**
 * Sign the current tab out, notify peer tabs, redirect.
 *
 * `redirectTarget` lets the caller customise the post-signout URL — e.g.
 * the heartbeat appends `?reason=session_expired` so the user sees an
 * explanatory toast on the way back to the login page.
 */
export async function signOutEverywhere(opts: {
  redirectTo?: string;
  broadcastReason?: string;
} = {}) {
  const { redirectTo = '/login', broadcastReason = 'logged_out' } = opts;

  // (2) Tell sibling tabs FIRST — if signOut() throws, we still want
  // peers to bail out.
  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    try {
      const ch = new BroadcastChannel(CHANNEL_NAME);
      ch.postMessage({ type: 'signout', reason: broadcastReason } satisfies AuthMessage);
      ch.close();
    } catch {
      // BroadcastChannel can throw if the document is unloading; not fatal.
    }
  }

  // (1) Tear down this tab.
  const supabase = createClient();
  try {
    await supabase.auth.signOut();
  } finally {
    clearAuthCookies();
    resetClient();
    if (typeof window !== 'undefined') {
      try {
        // Only remove keys this app owns. Previously sessionStorage.clear()
        // nuked everything, including unrelated UI state.
        sessionStorage.removeItem(SIGNOUT_KEY);
      } catch {
        /* SS access can throw under certain privacy modes — non-fatal */
      }
      window.location.href = redirectTo;
    }
  }
}
