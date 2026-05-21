'use client';

import { Sidebar } from '@/components/sidebar-responsive';
import { BlurOverlay } from '@/components/blur-overlay';
import { Toaster } from '@/components/ui/sonner';
import { useAutoLock } from '@/hooks/use-auto-lock';
import { useSessionHeartbeat } from '@/hooks/use-session-heartbeat';
import { TopRightControls } from '@/components/top-right-controls';
import { CompactProvider } from '@/contexts/compact-context';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAutoLock(5);
  useSessionHeartbeat();

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const gradientStyle = mounted ? {
    backgroundImage: resolvedTheme === 'dark'
      ? 'linear-gradient(60deg, #29323c 0%, #485563 100%)'
      : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  } : {};

  return (
    <CompactProvider>
      <BlurOverlay>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
            <main className="flex-1 overflow-auto w-full" style={gradientStyle}>
            {children}
          </main>
        </div>
        <TopRightControls />
        <Toaster position="bottom-right" />
      </BlurOverlay>
    </CompactProvider>
  );
}
