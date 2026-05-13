import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { heroContent } from '../i18n';

const EclipseCanvas = lazy(() => import('./BlackHoleCanvas'));

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
};

const useMobile = (breakpoint = 768) => {
  const [m, setM] = useState(false);
  useEffect(() => {
    const onResize = () => setM(window.innerWidth < breakpoint);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return m;
};

const Fallback = () => (
  <div
    aria-hidden="true"
    className="absolute inset-0"
    style={{ background: '#07070a' }}
  />
);

const BlackHoleHero = ({ language }) => {
  const copy = heroContent[language] || heroContent.en;
  const reduced = useReducedMotion();
  const mobile = useMobile();
  const sectionRef = useRef(null);

  const goLive = (e) => {
    e.preventDefault();
    document.getElementById('live')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-ink-950"
    >
      {/* Canvas backdrop (eclipse + scrolling lensed slogan) */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<Fallback />}>
          <EclipseCanvas slogan={copy.slogan} mobile={mobile} reducedMotion={reduced} />
        </Suspense>
      </div>

      {/* Cinematic edge vignette + bottom blend into next section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, #07070a 95%)',
        }}
      />

      {/* HTML overlay — absolute positions keep name fully below the eclipse */}
      <div className="relative z-20 h-full">
        {/* Eyebrow — top */}
        <div className="absolute inset-x-0 top-[12vh] flex justify-center px-6">
          <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.42em] text-bone-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-lamp-500 align-middle mr-3 shadow-[0_0_10px_rgba(245,176,86,0.7)]" />
            {copy.eyebrow}
          </p>
        </div>

        {/* Name + role + CTAs — lower third, clear of the disc */}
        <div className="absolute inset-x-0 bottom-[16vh] flex flex-col items-center gap-8 px-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <h1 className="font-display text-4xl md:text-6xl text-bone-50 tracking-tight leading-none">
              {copy.name}
            </h1>
            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.36em] text-bone-500">
              {copy.role}
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
            <a
              href="mailto:contact.yuhan@gmail.com"
              className="group inline-flex items-center gap-2 rounded-full border border-lamp-500/50 bg-lamp-500/[0.05] px-6 py-2.5 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-lamp-300 transition-all hover:bg-lamp-500/[0.13] hover:border-lamp-500/80"
            >
              {copy.cta}
              <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href="#live"
              onClick={goLive}
              className="group inline-flex items-center gap-2 rounded-full border border-bone-100/15 bg-bone-50/[0.03] px-6 py-2.5 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-bone-200 transition-all hover:border-bone-100/40 hover:text-bone-50"
            >
              {copy.secondaryCta}
              <ArrowDown size={13} className="transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Scroll hint — pinned to bottom */}
        <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 text-bone-500">
          <span className="font-mono text-[10px] uppercase tracking-[0.42em]">{copy.scrollHint}</span>
          <span aria-hidden="true" className="block h-8 w-px bg-gradient-to-b from-bone-500/70 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default BlackHoleHero;
