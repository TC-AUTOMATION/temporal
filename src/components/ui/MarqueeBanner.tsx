'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/stores/useStore';
import { useAdminStore } from '@/stores/useAdminStore';

export default function MarqueeBanner() {
  const { language, darkMode } = useStore();
  const { marqueeItems } = useAdminStore();
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState('20s');

  // Filter only active items
  const activeItems = marqueeItems.filter(item => item.isActive);

  // Adjust speed based on device
  useEffect(() => {
    const calculateDuration = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setAnimationDuration('12s');
      } else if (width >= 768) {
        setAnimationDuration('6s');
      } else {
        setAnimationDuration('5s');
      }
    };

    calculateDuration();
    window.addEventListener('resize', calculateDuration);
    return () => window.removeEventListener('resize', calculateDuration);
  }, []);

  // Style for images to prevent Safari blur during animations
  const imageStyle: React.CSSProperties = {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    imageRendering: 'auto',
  };

  // Generate a single item with text + logo
  const renderItem = (item: typeof activeItems[0], index: number) => (
    <div key={`${item.id}-${index}`} className="flex items-center flex-shrink-0">
      <img
        src="/logo-marquee.svg"
        alt="TPL"
        className="flex-shrink-0 mx-4 md:mx-8 w-7 h-7 md:w-9 md:h-9"
        style={imageStyle}
      />
      <span
        className="uppercase italic whitespace-nowrap text-base md:text-xl"
        style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em' }}
      >
        {language === 'fr' ? item.textFr : item.textEn}
      </span>
    </div>
  );

  // Create content - repeat items multiple times to ensure full coverage
  const renderAllItems = () => {
    const items = [];
    // Repeat 4 times to ensure content is wide enough for all screen sizes
    for (let repeat = 0; repeat < 4; repeat++) {
      for (let i = 0; i < activeItems.length; i++) {
        items.push(renderItem(activeItems[i], repeat * activeItems.length + i));
      }
    }
    return items;
  };

  return (
    <div
      className={`overflow-hidden py-1 border-b ${
        darkMode
          ? 'bg-white text-black border-black/10'
          : 'bg-black text-white border-white/10'
      }`}
    >
      <div
        ref={marqueeRef}
        className="flex items-center"
        style={{
          animation: `marquee ${animationDuration} linear infinite`,
          willChange: 'transform',
        }}
      >
        {/* First half */}
        <div className="flex items-center flex-shrink-0">
          {renderAllItems()}
        </div>
        {/* Second half - identical for seamless loop */}
        <div className="flex items-center flex-shrink-0">
          {renderAllItems()}
        </div>
      </div>
    </div>
  );
}
