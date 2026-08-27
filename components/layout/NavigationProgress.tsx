'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When pathname changes, finish the navigation progress
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // If clicking the current path, no navigation needed
      if (href === pathname || (href === '/dashboard' && pathname === '/')) {
        return;
      }

      // Start navigation indicator immediately
      setIsNavigating(true);
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, [pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden pointer-events-none">
      <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse w-full shadow-lg shadow-emerald-500/50"></div>
    </div>
  );
}

export default NavigationProgress;
