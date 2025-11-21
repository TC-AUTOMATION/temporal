'use client';

import { ChevronDown } from 'lucide-react';
import { useStore } from '@/stores/useStore';
import { translations } from '@/lib/translations';
import TemporalLogo from '@/components/ui/TemporalLogo';
import Starfield from '@/components/ui/Starfield';

export default function HeroSection() {
  const { language } = useStore();
  const t = translations[language];

  return (
    <section className="relative h-[70vh] bg-black flex flex-col items-center justify-center overflow-hidden">
      <Starfield />

      {/* Logo */}
      <div className="relative z-10">
        <TemporalLogo size={300} animate className="text-[#5B2D8E]" />
      </div>

      {/* December drop indicator */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <div className="flex items-center justify-center gap-2 text-white">
          <ChevronDown size={20} />
          <span className="font-medium tracking-wider">{t.decemberDrop}</span>
          <ChevronDown size={20} />
        </div>
      </div>
    </section>
  );
}
