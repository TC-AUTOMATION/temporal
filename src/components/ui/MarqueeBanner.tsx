'use client';

import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import Image from 'next/image';
import { Zap, Star } from 'lucide-react';

export default function MarqueeBanner() {
  const { language, darkMode } = useStore();
  const t = translations[language];

  const content = (
    <>
      <div className="flex items-center mx-10">
        <Image
          src="/header-temporal.svg"
          alt="TPL"
          width={60}
          height={60}
          className="mr-4"
        />
        <span
          className="uppercase italic"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.2rem' }}
        >
          {t.marquee1}
        </span>
      </div>

      <div className="flex items-center mx-10">
        <Image
          src="/header-temporal.svg"
          alt="TPL"
          width={60}
          height={60}
          className="mr-4"
        />
        <span
          className="uppercase italic"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.2rem' }}
        >
          {t.marquee2}
        </span>
      </div>

      <div className="flex items-center mx-10">
        <Image
          src="/header-temporal.svg"
          alt="TPL"
          width={60}
          height={60}
          className="mr-4"
        />
        <span
          className="uppercase italic"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.2rem' }}
        >
          {t.marquee1}
        </span>
      </div>

      <div className="flex items-center mx-10">
        <Image
          src="/header-temporal.svg"
          alt="TPL"
          width={60}
          height={60}
          className="mr-4"
        />
        <span
          className="uppercase italic"
          style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.15em', fontSize: '1.2rem' }}
        >
          {t.marquee2}
        </span>
      </div>
    </>
  );

  return (
    <div
      className={`overflow-hidden py-2 border-b ${
        darkMode
          ? 'bg-white text-black border-black/10'
          : 'bg-black text-white border-white/10'
      }`}
    >
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}
