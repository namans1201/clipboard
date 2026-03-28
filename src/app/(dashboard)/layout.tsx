'use client';

import { Sidebar } from '@/components/sidebar-responsive';
import { BlurOverlay } from '@/components/blur-overlay';
import { Toaster } from '@/components/ui/sonner';
import { useAutoLock } from '@/hooks/use-auto-lock';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enable auto-lock for public devices (5 minutes)
  useAutoLock(5);

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
