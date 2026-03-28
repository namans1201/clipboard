'use client';

import { Sidebar } from '@/components/sidebar';
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
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </BlurOverlay>
  );
}
