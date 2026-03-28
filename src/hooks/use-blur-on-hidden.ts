'use client';

import { useEffect, useState } from 'react';

export function useBlurOnHidden() {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Only enable blur for public devices
    const isPublicDevice = sessionStorage.getItem('is_public_device') === 'true';
    if (!isPublicDevice) return;

    const handleVisibilityChange = () => {
      setIsBlurred(document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isBlurred;
}
