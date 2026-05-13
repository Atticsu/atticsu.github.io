import React from 'react';
import { Cpu, Terminal, Database } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Reveal from '../components/Reveal';
import { manifestoContent } from '../i18n';

const ICONS = { cpu: Cpu, terminal: Terminal, database: Database };

const ManifestoSection = ({ language }) => {
  const copy = manifestoContent[language] || manifestoContent.en;

  return (
    <section id="about" className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink-700/80 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          number={copy.number}
          kicker={copy.kicker}
          title={
            <>
              A quiet <span className="italic text-bone-200">discipline</span> <br className="hidden md:block" />
              for finding signal.
            </>
          }
          intro={copy.pullQuote}
        />

        <div className="mt-24 grid gap-8 md:gap-12">
          {copy.techStacks.map((stack, idx) => {
            const Icon = ICONS[stack.icon] || Cpu;
            const indexLabel = `0${idx + 1}`;
            return (
              <Reveal key={stack.title} delay={idx * 90}>
                <article className="group relative grid grid-cols-1 gap-8 border-t border-ink-700/70 py-10 transition-colors hover:border-lamp-500/40 md:grid-cols-12 md:gap-10">
                  <div className="md:col-span-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone-500">
                      {indexLabel}
                    </p>
                  </div>
                  <div className="md:col-span-7">
                    <h3 className="font-display text-3xl md:text-4xl text-bone-50 leading-tight">
                      {stack.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-bone-400 leading-relaxed italic font-light">
                      {stack.summary}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-bone-500">
                      {stack.skills.map((s) => (
                        <li key={s} className="flex items-center gap-2">
                          <span className="inline-block h-1 w-1 rounded-full bg-bone-700 group-hover:bg-lamp-500 transition-colors" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="hidden md:col-span-3 md:flex items-start justify-end">
                    <Icon
                      size={48}
                      strokeWidth={1}
                      className="text-bone-700 transition-colors duration-500 group-hover:text-lamp-500 group-hover:drop-shadow-[0_0_16px_rgba(245,176,86,0.45)]"
                    />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mt-32 grid grid-cols-1 gap-10 border-t border-ink-700/60 pt-16 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-lamp-500">
                {copy.aboutTitle}
              </p>
            </div>
            <div className="md:col-span-8 space-y-6 text-lg md:text-xl text-bone-300 leading-relaxed font-light">
              {copy.aboutParagraphs.map((p, i) => (
                <p key={i} className={i === 0 ? 'font-display italic text-2xl md:text-3xl text-bone-100 leading-snug' : ''}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ManifestoSection;
