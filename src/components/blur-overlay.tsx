'use client';

import { useBlurOnHidden } from '@/hooks/use-blur-on-hidden';
import { cn } from '@/lib/utils';

interface BlurOverlayProps {
  children: React.ReactNode;
}

export function BlurOverlay({ children }: BlurOverlayProps) {
  const isBlurred = useBlurOnHidden();

  return (
    <div className={cn('transition-all duration-200', isBlurred && 'blur-lg pointer-events-none select-none')}>
      {children}
    </div>
  );
}
