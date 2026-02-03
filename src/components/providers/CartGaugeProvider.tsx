'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import CartGauge from '@/components/ui/CartGauge';

// Pages where the gauge should NOT appear
const excludedPaths = [
  '/admin',
  '/login',
  '/register',
  '/reset-password',
  '/checkout',
];

export default function CartGaugeProvider() {
  const pathname = usePathname();
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Check if user has entered the site (passed the landing page)
    const entered = sessionStorage.getItem('temporal-entered');
    setHasEntered(entered === 'true');

    // Listen for storage changes (when user enters from landing page)
    const handleStorage = () => {
      const entered = sessionStorage.getItem('temporal-entered');
      setHasEntered(entered === 'true');
    };

    window.addEventListener('storage', handleStorage);

    // Also check periodically for same-tab updates
    const interval = setInterval(() => {
      const entered = sessionStorage.getItem('temporal-entered');
      if (entered === 'true' && !hasEntered) {
        setHasEntered(true);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [hasEntered]);

  // Check if current path should exclude the gauge
  const shouldHide = excludedPaths.some(path => pathname?.startsWith(path));

  // Hide on excluded paths OR if user hasn't entered yet (landing page)
  if (shouldHide || !hasEntered) {
    return null;
  }

  return <CartGauge />;
}
