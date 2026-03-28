'use client';

import { useEffect, useCallback } from 'react';
import { clearAuthCookies, createClient, resetClient } from '@/lib/supabase/client';

export function useAutoLock(timeoutMinutes: number = 5) {
  const handleLogout = useCallback(async () => {
    const supabase = createClient();

    try {
      await supabase.auth.signOut();
    } finally {
      clearAuthCookies();
      resetClient();
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    // Only enable auto-lock for public devices
    const isPublicDevice = sessionStorage.getItem('is_public_device') === 'true';
    if (!isPublicDevice) return;

    let timeout: NodeJS.Timeout;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleLogout, timeoutMs);
    };

    // Events that reset the timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Start timer
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMinutes, handleLogout]);
}
