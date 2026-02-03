'use client';

import { Eye } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import { useState, useEffect, useRef } from 'react';

interface ViewerCountProps {
  productId: string;
}

// Generate a unique visitor ID for this browser session
function getVisitorId(): string {
  if (typeof window === 'undefined') return '';

  let visitorId = sessionStorage.getItem('temporal_visitor_id');
  if (!visitorId) {
    visitorId = `v_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('temporal_visitor_id', visitorId);
  }
  return visitorId;
}

export default function ViewerCount({ productId }: ViewerCountProps) {
  const { darkMode, language } = useStore();
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const visitorIdRef = useRef<string>('');

  useEffect(() => {
    setIsClient(true);
    visitorIdRef.current = getVisitorId();

    const registerViewer = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/viewers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId: visitorIdRef.current }),
        });
        if (response.ok) {
          const data = await response.json();
          setViewerCount(data.count);
        }
      } catch (error) {
        console.error('Error registering viewer:', error);
      }
    };

    const fetchViewerCount = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/viewers`);
        if (response.ok) {
          const data = await response.json();
          setViewerCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching viewer count:', error);
      }
    };

    // Initial registration
    registerViewer();

    // Heartbeat every 15 seconds to stay active
    const heartbeatInterval = setInterval(registerViewer, 15 * 1000);

    // Poll for updates every 10 seconds (to see other viewers)
    const pollInterval = setInterval(fetchViewerCount, 10 * 1000);

    // Cleanup when leaving the page
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable cleanup on page leave
      const data = JSON.stringify({ visitorId: visitorIdRef.current });
      navigator.sendBeacon(
        `/api/products/${productId}/viewers`,
        new Blob([data], { type: 'application/json' })
      );
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - could remove viewer but let's keep them for 30s timeout
      } else {
        // Page visible again - re-register
        registerViewer();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pollInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Try to unregister viewer
      fetch(`/api/products/${productId}/viewers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId: visitorIdRef.current }),
      }).catch(() => {});
    };
  }, [productId]);

  // Don't render on server to avoid hydration mismatch
  if (!isClient || viewerCount === null) {
    return null;
  }

  const t = translations[language];
  const text = viewerCount === 1
    ? `1 ${t.viewerCountSingular}`
    : `${viewerCount} ${t.viewerCountPlural}`;

  return (
    <div
      className={`flex items-center gap-2 py-3 px-4 rounded-lg ${
        darkMode
          ? 'bg-white/5 border border-white/10'
          : 'bg-primary/5 border border-primary/10'
      }`}
    >
      <Eye
        size={18}
        className={darkMode ? 'text-white' : 'text-primary'}
      />
      <span
        className={`text-sm ${
          darkMode
            ? 'text-white'
            : 'text-primary'
        }`}
        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
      >
        {text}
      </span>
      {/* Petit indicateur animé pour montrer l'activité */}
      <span className="relative flex h-2 w-2 ml-auto">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
          darkMode ? 'bg-white' : 'bg-primary'
        }`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          darkMode ? 'bg-white' : 'bg-primary'
        }`}></span>
      </span>
    </div>
  );
}
