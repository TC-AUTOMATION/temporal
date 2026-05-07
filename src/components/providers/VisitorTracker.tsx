'use client';

import { useEffect, useRef } from 'react';

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('temporal_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('temporal_visitor_id', id);
  }
  return id;
}

export default function VisitorTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;

    const heartbeat = () => {
      navigator.sendBeacon(
        '/api/admin/online-visitors',
        new Blob([JSON.stringify({ visitorId })], { type: 'application/json' })
      );
    };

    // Initial heartbeat
    heartbeat();

    // Send heartbeat every 15 seconds
    intervalRef.current = setInterval(heartbeat, 15_000);

    // Cleanup on unmount / tab close
    const handleUnload = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Use sendBeacon for DELETE via a POST with _method hint —
      // but since sendBeacon only does POST, we just let the server expire the entry
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  return null;
}
