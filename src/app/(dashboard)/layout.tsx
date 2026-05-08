'use client';

import { Sidebar } from '@/components/sidebar-responsive';
import { BlurOverlay } from '@/components/blur-overlay';
import { Toaster } from '@/components/ui/sonner';
import { useAutoLock } from '@/hooks/use-auto-lock';
import { useSessionHeartbeat } from '@/hooks/use-session-heartbeat';
import { TopRightControls } from '@/components/top-right-controls';
import { CompactProvider } from '@/contexts/compact-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoLock(5);
  useSessionHeartbeat();

  return (
    <CompactProvider>
      <BlurOverlay>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto w-full">
            {children}
          </main>
        </div>
        <TopRightControls />
        <Toaster position="bottom-right" />
      </BlurOverlay>
    </CompactProvider>
  );
}
