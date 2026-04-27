'use client';

import { useEffect, useCallback } from 'react';
import { createClient, clearAuthCookies, resetClient } from '@/lib/supabase/client';

/**
 * Validates the public-device session expiry every 60 seconds.
 *
 * On login the server stamps `public_session_expires_at` (epoch ms) into
 * user_metadata.  This hook reads that value from the live session and
 * forces a sign-out + redirect as soon as the timestamp is in the past.
 *
 * Only activates when `sessionStorage.is_public_device === 'true'`.
 */
export function useSessionHeartbeat(intervalMs = 60_000) {
  const forceLogout = useCallback(async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } finally {
      clearAuthCookies();
      resetClient();
      window.location.href = '/login?reason=session_expired';
    }
  }, []);

  useEffect(() => {
    const isPublicDevice = sessionStorage.getItem('is_public_device') === 'true';
    if (!isPublicDevice) return;

    const check = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Session is already gone – redirect to login
        clearAuthCookies();
        resetClient();
        window.location.href = '/login?reason=session_expired';
        return;
      }

      const expiresAt: number | undefined =
        session.user.user_metadata?.public_session_expires_at;

      if (expiresAt && Date.now() > expiresAt) {
        await forceLogout();
      }
    };

    // Run immediately on mount, then on every interval
    check();
    const id = setInterval(check, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, forceLogout]);
}
