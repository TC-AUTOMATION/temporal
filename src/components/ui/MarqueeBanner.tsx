'use client';

import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';

export default function MarqueeBanner() {
  const { language, darkMode } = useStore();
  const t = translations[language];

  const content = (
    <>
      <span className="mx-8 font-medium tracking-wider text-sm">
        <span className="italic mr-2">tpl</span>
        {t.marquee1}
      </span>
      <span className="mx-8 font-medium tracking-wider text-sm">
        <span className="italic mr-2">tpl</span>
        {t.marquee2}
      </span>
      <span className="mx-8 font-medium tracking-wider text-sm">
        <span className="italic mr-2">tpl</span>
        {t.marquee1}
      </span>
      <span className="mx-8 font-medium tracking-wider text-sm">
        <span className="italic mr-2">tpl</span>
        {t.marquee2}
      </span>
    </>
  );

  return (
    <div
      className={`overflow-hidden py-2 ${
        darkMode ? 'bg-white text-black' : 'bg-black text-white'
      }`}
    >
      <div className="animate-marquee whitespace-nowrap flex">
        {content}
        {content}
      </div>
    </div>
  );
}
