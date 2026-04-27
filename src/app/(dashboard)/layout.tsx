'use client';

import { Sidebar } from '@/components/sidebar-responsive';
import { BlurOverlay } from '@/components/blur-overlay';
import { Toaster } from '@/components/ui/sonner';
import { useAutoLock } from '@/hooks/use-auto-lock';
import { useSessionHeartbeat } from '@/hooks/use-session-heartbeat';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Client-side inactivity lock (5 minutes of no mouse/keyboard activity)
  useAutoLock(5);
  // Client-side heartbeat that validates the server-stamped 15-minute
  // absolute expiry for public-device sessions every 60 seconds.
  useSessionHeartbeat();

  return (
    <BlurOverlay>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto w-full">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </BlurOverlay>
  );
}
