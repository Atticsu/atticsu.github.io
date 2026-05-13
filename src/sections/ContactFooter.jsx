import React from 'react';
import { Mail, ArrowUpRight, Linkedin, Download } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Reveal from '../components/Reveal';
import { contactContent } from '../i18n';

const RESUME_ASSET_URL = '/assets/resume.pdf';

const ContactFooter = ({ language }) => {
  const copy = contactContent[language] || contactContent.en;

  const links = [
    { href: 'mailto:contact.yuhan@gmail.com', label: copy.email, value: 'contact.yuhan@gmail.com', Icon: Mail },
    { href: 'https://www.linkedin.com/in/yuhan-wu-645b74295/', label: copy.linkedin, value: 'linkedin.com/in/yuhan-wu', Icon: Linkedin },
    { href: RESUME_ASSET_URL, label: copy.cv, value: 'resume.pdf', Icon: Download },
  ];

  return (
    <footer id="contact" className="relative px-6 pt-32 pb-16 md:px-12 md:pt-48 md:pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink-700/80 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          number={copy.number}
          kicker={copy.kicker}
          title={
            <>
              <span className="italic text-bone-200">{copy.title}.</span>
            </>
          }
          intro={copy.description}
        />

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-3">
          {links.map(({ href, label, value, Icon }, idx) => (
            <Reveal key={label} delay={idx * 90}>
              <a
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noreferrer' : undefined}
                className="group flex h-full flex-col justify-between rounded-2xl border border-ink-700/70 bg-ink-900/40 p-6 transition-all hover:border-lamp-500/50 hover:bg-ink-900/70"
              >
                <div className="flex items-center justify-between">
                  <Icon size={20} className="text-bone-500 transition-colors group-hover:text-lamp-300" />
                  <ArrowUpRight
                    size={18}
                    className="text-bone-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lamp-300"
                  />
                </div>
                <div className="mt-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone-500">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-2xl text-bone-50">{value}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-32 border-t border-ink-700/60 pt-10">
            <p className="font-display italic text-3xl md:text-5xl text-bone-300 leading-tight max-w-3xl">
              {copy.sloganRepeat}
            </p>
            <div className="mt-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone-500">
                {copy.copyright}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone-600">
                Paris · Shanghai
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
};

export default ContactFooter;
