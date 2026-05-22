'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/sidebar-responsive';
import { BlurOverlay } from '@/components/blur-overlay';
import { Toaster } from '@/components/ui/sonner';
import { useAutoLock } from '@/hooks/use-auto-lock';
import { useSessionHeartbeat } from '@/hooks/use-session-heartbeat';
import { TopRightControls } from '@/components/top-right-controls';
import { CompactProvider } from '@/contexts/compact-context';
import { subscribeToSignoutBroadcasts } from '@/lib/signout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoLock(5);
  useSessionHeartbeat();

  // Listen for sign-out broadcasts from peer tabs (BroadcastChannel) — if
  // any other tab in the same browser signs out, this one jumps to /login
  // immediately instead of waiting for the next request to be 307'd.
  useEffect(() => subscribeToSignoutBroadcasts(), []);

  // Colors swapped: <main> now uses the swapped solid --background (was the
  // sidebar's tone), and <Sidebar> now paints the --surface-gradient (the
  // grey-to-blue-grey ramp that used to live here). Both defined in
  // globals.css per theme — no useTheme needed.
  return (
    <CompactProvider>
      <BlurOverlay>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          {/* `relative` makes <main> the offset parent for TopRightControls,
              which uses position: absolute. Result: the controls sit at the
              top-right of the page content and scroll up with the rest of
              the content (like the search bar and + button do), instead of
              floating fixed to the viewport. */}
          <main className="flex-1 overflow-auto w-full bg-background relative">
            <TopRightControls />
            {children}
          </main>
        </div>
      </BlurOverlay>
      <Toaster position="bottom-right" />
    </CompactProvider>
  );
}
