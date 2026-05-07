'use client';

import { useStore } from '@/stores/useStore';
import { useEffect, useState } from 'react';
import MarqueeBanner from '@/components/ui/MarqueeBanner';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import CartDrawer from '@/components/cart/CartDrawer';
import SearchOverlay from '@/components/layout/SearchOverlay';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const { darkMode } = useStore();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0a0a0a] text-white' : 'bg-[#fafafa] text-black'}`}>
        <MarqueeBanner />
        <Header showLogo />
        <Sidebar />
        <CartDrawer />
        <SearchOverlay />

        <main className="relative">
          {/* Hero Header */}
          <div className={`relative overflow-hidden ${darkMode ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute -top-1/2 -right-1/4 w-[80%] h-[200%] blur-3xl opacity-30 transition-transform duration-700"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.6) 0%, rgba(91, 45, 142, 0.2) 40%, transparent 70%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.3) 0%, rgba(91, 45, 142, 0.1) 40%, transparent 70%)',
                  transform: `translateY(${scrollY * 0.15}px)`,
                }}
              />
              <div
                className="absolute -bottom-1/2 -left-1/4 w-[60%] h-[150%] blur-3xl opacity-20 transition-transform duration-700"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.5) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.25) 0%, transparent 60%)',
                  transform: `translateY(${scrollY * -0.1}px)`,
                }}
              />
              {/* Third gradient blob - center accent */}
              <div
                className="absolute top-1/3 left-1/3 w-[40%] h-[60%] blur-3xl opacity-10 transition-transform duration-700"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.8) 0%, transparent 50%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.4) 0%, transparent 50%)',
                  transform: `translateY(${scrollY * 0.08}px) translateX(${scrollY * -0.03}px)`,
                }}
              />
              {/* Subtle noise texture */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />

            <div className="relative max-w-4xl mx-auto px-4 pt-16 md:pt-20 pb-12">
              <h1
                className="text-5xl md:text-6xl lg:text-7xl leading-none mb-3"
                style={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  letterSpacing: '0.02em',
                  transform: `translateY(${scrollY * 0.2}px)`,
                }}
              >
                QUI SOMMES-NOUS
              </h1>
              <p
                className={`text-sm md:text-base ${darkMode ? 'text-white/50' : 'text-black/50'}`}
                style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
              >
                L'histoire derrière Temporal
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-24">
            {/* Background gradient blobs for content area */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute top-1/4 -right-1/4 w-[50%] h-[60%] blur-3xl opacity-10"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.5) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.25) 0%, transparent 60%)',
                  transform: `translateY(${scrollY * -0.05}px)`,
                }}
              />
              <div
                className="absolute bottom-1/4 -left-1/4 w-[40%] h-[50%] blur-3xl opacity-[0.08]"
                style={{
                  background: darkMode
                    ? 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.4) 0%, transparent 60%)'
                    : 'radial-gradient(ellipse at center, rgba(91, 45, 142, 0.2) 0%, transparent 60%)',
                  transform: `translateY(${scrollY * 0.03}px)`,
                }}
              />
            </div>
            <div className="space-y-8">

              <div className="pb-4 relative">
                <div className={`absolute -left-2 top-0 bottom-0 w-1 ${darkMode ? 'bg-primary/20' : 'bg-primary/15'}`} />
                <div className={`absolute -left-2 top-0 h-1/3 w-1 bg-primary`} style={{ transform: `translateY(${scrollY * 0.05}px)` }} />
                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'} pl-6`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}>
                  Temporal — plus qu'une marque, un état d'esprit
                </h2>
                <div className={`h-1 w-24 bg-primary ml-6`} />
              </div>

              <div className="pl-6 space-y-6">
                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  Temporal n'est pas simplement une marque de vêtements. C'est une vision, un rappel constant que le temps est précieux et qu'il ne faut pas attendre demain pour commencer à vivre pleinement.
                </p>

                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  J'ai créé Temporal à partir d'une idée simple, mais essentielle : <span className="font-bold text-primary">ne pas rêver sa vie, mais vivre ses rêves</span>.
                </p>

                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  Dans un monde où tout va vite, où l'on remet sans cesse les choses à plus tard, j'ai voulu créer quelque chose qui réveille, qui motive et qui pousse à passer à l'action. Temporal existe pour rappeler que chaque instant compte, que le temps passe quoi qu'il arrive, et que ce que l'on en fait dépend uniquement de nous.
                </p>
              </div>

              {/* Section */}
              <div className="pt-12 pb-4 relative">
                <div className={`absolute -left-2 top-12 bottom-0 w-1 ${darkMode ? 'bg-primary/20' : 'bg-primary/15'}`} />
                <div className={`absolute -left-2 top-12 h-1/3 w-1 bg-primary`} style={{ transform: `translateY(${scrollY * 0.03}px)` }} />
                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'} pl-6`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}>
                  Pourquoi j'ai créé Temporal
                </h2>
                <div className={`h-1 w-24 bg-primary ml-6`} />
              </div>

              <div className="pl-6 space-y-6">
                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  <span className="text-primary font-bold">Temporal est né d'un parcours personnel.</span> Plus jeune, j'ai souvent été confronté aux moqueries parce que je ne portais pas de marques ou de vêtements considérés comme "tendances". À l'époque, je le vivais mal. Mais avec le temps, ces expériences ont planté une graine : celle de vouloir créer mes propres vêtements, avec mes propres codes et surtout avec du sens.
                </p>

                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  Au départ, mon rêve était de devenir styliste pour de grandes marques comme Nike. J'étais passionné par la mode, le streetwear, les sneakers, le design. Puis j'ai compris une chose : je ne voulais pas simplement créer des vêtements. Je voulais transmettre quelque chose de plus profond.
                </p>

                <div className={`relative my-8 py-6 px-6 border-l-4 border-primary ${darkMode ? 'bg-primary/5' : 'bg-primary/5'}`}>
                  <p className={`text-xl md:text-2xl font-bold leading-relaxed text-primary`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                    Temporal est devenu une évidence. Pas comme une marque "lambda", mais comme un projet capable d'inspirer, de motiver et d'aider les gens à croire en eux et en leurs projets.
                  </p>
                </div>
              </div>

              {/* Section */}
              <div className="pt-12 pb-4 relative">
                <div className={`absolute -left-2 top-12 bottom-0 w-1 ${darkMode ? 'bg-primary/20' : 'bg-primary/15'}`} />
                <div className={`absolute -left-2 top-12 h-1/3 w-1 bg-primary`} style={{ transform: `translateY(${scrollY * 0.02}px)` }} />
                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'} pl-6`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}>
                  Temporal, le temps et le sens
                </h2>
                <div className={`h-1 w-24 bg-primary ml-6`} />
              </div>

              <div className="pl-6 space-y-6">
                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  Le nom <span className="font-bold text-primary">Temporal</span> fait directement référence au temps. Ce temps qui passe, que l'on laisse parfois filer sans s'en rendre compte, mais qui est pourtant notre ressource la plus précieuse.
                </p>

                <div className={`relative py-8 border-t border-b ${darkMode ? 'border-primary/30' : 'border-primary/20'}`}>
                  <p className="text-2xl md:text-3xl font-bold text-primary text-center" style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}>
                    RIEN N'A ÉTÉ CHOISI AU HASARD.
                  </p>
                </div>

                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  Le nom Temporal est aussi composé des lettres de mon nom et de mon prénom. Il représente le lien direct entre qui je suis, ce que j'ai vécu et le message que je veux transmettre à travers cette marque.
                </p>

                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  Temporal, c'est avant tout une réflexion autour du <span className="font-bold text-primary">temps</span>, de l'<span className="font-bold text-primary">identité</span> et de la <span className="font-bold text-primary">conscience de l'instant présent</span>. C'est un rappel constant que la vie est courte, que demain n'est jamais garanti, et qu'il faut oser vivre la vie que l'on souhaite vraiment.
                </p>
              </div>

              {/* Section */}
              <div className="pt-12 pb-4 relative">
                <div className={`absolute -left-2 top-12 bottom-0 w-1 ${darkMode ? 'bg-primary/20' : 'bg-primary/15'}`} />
                <div className={`absolute -left-2 top-12 h-1/3 w-1 bg-primary`} style={{ transform: `translateY(${scrollY * 0.04}px)` }} />
                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'} pl-6`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}>
                  Le message derrière chaque pièce
                </h2>
                <div className={`h-1 w-24 bg-primary ml-6`} />
              </div>

              <div className="pl-6 space-y-6">
                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  À travers Temporal, mon objectif n'a jamais été de simplement vendre des vêtements. Je veux créer des pièces qui portent un message, qui accompagnent les gens dans leur quotidien et qui leur rappellent, chaque jour, qu'ils ont le pouvoir d'agir.
                </p>

                <div className="py-6">
                  <p className={`text-xl md:text-2xl font-bold mb-6 text-primary`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                    Temporal est là pour :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`flex items-center gap-3 p-4 rounded ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <p className={`text-lg md:text-xl ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>Remotiver</p>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <p className={`text-lg md:text-xl ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>Redonner de l'élan</p>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <p className={`text-lg md:text-xl ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>Encourager la discipline</p>
                    </div>
                    <div className={`flex items-center gap-3 p-4 rounded ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <p className={`text-lg md:text-xl ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>Pousser à l'action</p>
                    </div>
                  </div>
                </div>

                <div className={`relative py-6 px-8 ${darkMode ? 'bg-primary/5' : 'bg-primary/5'} rounded-lg`}>
                  <div className="absolute top-4 left-4 text-6xl text-primary/20">"</div>
                  <p className="text-xl md:text-2xl italic leading-relaxed text-center relative z-10" style={{ fontFamily: '"Archivo", sans-serif' }}>
                    Le temps passe, alors qu'est-ce que je fais <span className="font-bold text-primary">aujourd'hui</span> pour me rapprocher de mes rêves ?
                  </p>
                  <div className="absolute bottom-4 right-4 text-6xl text-primary/20">"</div>
                </div>
              </div>

              {/* Section */}
              <div className="pt-12 pb-4 relative">
                <div className={`absolute -left-2 top-12 bottom-0 w-1 ${darkMode ? 'bg-primary/20' : 'bg-primary/15'}`} />
                <div className={`absolute -left-2 top-12 h-1/3 w-1 bg-primary`} style={{ transform: `translateY(${scrollY * 0.01}px)` }} />
                <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'} pl-6`} style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.02em' }}>
                  Une communauté avant tout
                </h2>
                <div className={`h-1 w-24 bg-primary ml-6`} />
              </div>

              <div className="pl-6 space-y-6">
                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  Temporal n'est pas pensé pour créer de simples clients. Je veux construire quelque chose de plus fort : une <span className="font-bold text-primary">communauté</span>, presque une <span className="font-bold text-primary">famille</span>, réunie autour des mêmes valeurs.
                </p>

                <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                  Derrière chaque vêtement, il y a l'idée d'un cercle fermé, d'un lien réel entre la marque et les personnes qui la portent. Temporal est là pour accompagner, soutenir et rappeler que chacun mérite de croire en ses projets et de les vivre pleinement.
                </p>

                <div className={`py-8 space-y-6 border-l-4 border-primary pl-6 ${darkMode ? 'bg-primary/5' : 'bg-primary/5'} rounded-r-lg`}>
                  <p className={`text-xl md:text-2xl font-bold leading-relaxed ${darkMode ? 'text-white' : 'text-black'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                    Porter Temporal, ce n'est pas seulement porter un vêtement.
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-primary" style={{ fontFamily: '"Archivo", sans-serif' }}>
                    C'est porter un message.
                  </p>
                  <p className={`text-lg md:text-xl leading-relaxed ${darkMode ? 'text-white/85' : 'text-black/85'}`} style={{ fontFamily: '"Archivo", sans-serif' }}>
                    C'est se rappeler que le temps est précieux, et qu'il mérite d'être utilisé pour construire la vie que l'on veut vraiment vivre.
                  </p>
                </div>
              </div>

              {/* Final Statement */}
              <div className="py-16 md:py-20 text-center">
                <p
                  className="text-4xl md:text-5xl lg:text-6xl text-primary leading-tight"
                  style={{ fontFamily: '"Bebas Neue", sans-serif', letterSpacing: '0.05em' }}
                >
                  LE TEMPS,
                  <br />
                  C'EST MAINTENANT.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
