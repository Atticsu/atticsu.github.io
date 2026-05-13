import React from 'react';
import { Download, ArrowUpRight } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Reveal from '../components/Reveal';
import { resumeContent } from '../i18n';

const RESUME_ASSET_URL = '/assets/resume.pdf';

const TimelineBlock = ({ title, meta, secondary, period, bullets, note, delay = 0 }) => (
  <Reveal delay={delay}>
    <article className="group relative pl-10">
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-ink-950 ring-2 ring-lamp-500/80 transition-all duration-500 group-hover:scale-125 group-hover:shadow-[0_0_22px_rgba(245,176,86,0.6)]"
      />
      <span aria-hidden="true" className="absolute left-[5px] top-6 bottom-[-2.5rem] w-px bg-ink-700/70 last:hidden" />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-display text-2xl text-bone-50 leading-tight">{title}</h4>
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone-500">{period}</span>
      </div>
      {meta && <p className="mt-1 text-sm text-bone-300">{meta}</p>}
      {secondary && <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-bone-500">{secondary}</p>}
      {note && <p className="mt-3 text-sm text-bone-400 leading-relaxed">{note}</p>}
      {bullets && bullets.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm text-bone-400 leading-relaxed">
          {bullets.map((b, i) => (
            <li key={i} className="relative pl-4">
              <span aria-hidden="true" className="absolute left-0 top-2.5 h-px w-2 bg-lamp-500/60" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </article>
  </Reveal>
);

const ResumeSection = ({ language }) => {
  const copy = resumeContent[language] || resumeContent.en;

  return (
    <section id="resume" className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink-700/80 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader number={copy.number} kicker={copy.kicker} title={copy.title} intro={copy.subtitle} />
          <Reveal delay={200}>
            <a
              href={RESUME_ASSET_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-bone-100/15 bg-bone-50/[0.04] px-5 py-2.5 text-xs font-mono uppercase tracking-[0.28em] text-bone-100 transition-all hover:border-lamp-500/70 hover:bg-lamp-500/[0.08] hover:text-lamp-300"
            >
              <Download size={14} />
              {copy.openPdf}
              <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.24em] text-bone-500">
            {copy.contact}
          </p>
        </Reveal>

        <div className="mt-24 grid grid-cols-1 gap-20 md:grid-cols-12">
          <header className="md:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-lamp-500">
              {copy.educationTitle}
            </p>
          </header>
          <div className="md:col-span-9 space-y-12">
            {copy.education.map((edu, idx) => (
              <TimelineBlock
                key={`${edu.school}-${idx}`}
                title={edu.school}
                meta={edu.title}
                secondary={edu.location}
                period={edu.period}
                note={edu.note}
                delay={idx * 80}
              />
            ))}
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-20 border-t border-ink-700/60 pt-20 md:grid-cols-12">
          <header className="md:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-lamp-500">
              {copy.experienceTitle}
            </p>
          </header>
          <div className="md:col-span-9 space-y-14">
            {copy.experiences.map((role, idx) => (
              <TimelineBlock
                key={`${role.company}-${idx}`}
                title={role.title}
                meta={`${role.company} · ${role.location}`}
                period={role.period}
                bullets={role.bullets}
                delay={idx * 80}
              />
            ))}
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-20 border-t border-ink-700/60 pt-20 md:grid-cols-12">
          <header className="md:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-lamp-500">
              {copy.projectTitle}
            </p>
          </header>
          <div className="md:col-span-9 space-y-14">
            {copy.projects.map((proj, idx) => (
              <TimelineBlock
                key={`${proj.title}-${idx}`}
                title={proj.title}
                meta={proj.role}
                secondary={proj.location}
                period={proj.period}
                bullets={proj.bullets}
                delay={idx * 80}
              />
            ))}
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-20 border-t border-ink-700/60 pt-20 md:grid-cols-12">
          <header className="md:col-span-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-lamp-500">
              {copy.skillsTitle}
            </p>
          </header>
          <div className="md:col-span-9 grid gap-6 md:grid-cols-3">
            {copy.skills.map((item, idx) => (
              <Reveal key={item.label} delay={idx * 90}>
                <div className="rounded-2xl border border-ink-700/70 bg-ink-900/40 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-lamp-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm text-bone-200 leading-relaxed">{item.value}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumeSection;
