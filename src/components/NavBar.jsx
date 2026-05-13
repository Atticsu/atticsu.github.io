import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { uiText } from '../i18n';
import LanguageSwitcher from './LanguageSwitcher';
import { useActiveSection } from '../lib/useInView';

const NAV_LINKS = [
  { id: 'about', labelKey: 'about' },
  { id: 'resume', labelKey: 'resume' },
  { id: 'portfolio', labelKey: 'portfolio' },
  { id: 'live', labelKey: 'live' },
  { id: 'contact', labelKey: 'contact' },
];

const NAV_IDS = NAV_LINKS.map((n) => n.id);

const NavBar = ({ language, setLanguage }) => {
  const copy = uiText[language] || uiText.en;
  const brandName = copy.brandName || uiText.en.brandName;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = useActiveSection(NAV_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (id) => (e) => {
    e.preventDefault();
    setMobileOpen(false);
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled
          ? 'bg-ink-950/75 backdrop-blur-xl border-b border-ink-700/60'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <a
          href="#hero"
          onClick={handleNav('hero')}
          className="group flex items-center gap-2 text-bone-50"
          aria-label="Home"
        >
          <span
            className="block h-2.5 w-2.5 rounded-full bg-lamp-500 shadow-[0_0_18px_rgba(245,176,86,0.65)] animate-lamp-pulse"
            aria-hidden="true"
          />
          <span className="font-display text-xl tracking-tight">
            {brandName.primary}
            {brandName.accent && (
              <>
                {' '}
                <span className="italic text-bone-400">{brandName.accent}</span>
              </>
            )}
          </span>
          <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-[0.32em] text-bone-500 md:inline">
            {copy.brandTagline}
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={handleNav(link.id)}
                className={`group relative font-mono text-[11px] uppercase tracking-[0.28em] transition-colors ${
                  isActive ? 'text-bone-50' : 'text-bone-500 hover:text-bone-100'
                }`}
              >
                {copy.nav[link.labelKey]}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-lamp-500 transition-all duration-500 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher language={language} setLanguage={setLanguage} />
          <a
            href="mailto:contact.yuhan@gmail.com"
            className="hidden items-center gap-1.5 rounded-full border border-bone-100/15 bg-bone-50/[0.04] px-4 py-1.5 text-xs font-mono uppercase tracking-[0.22em] text-bone-100 transition-all hover:border-lamp-500/70 hover:bg-lamp-500/[0.08] hover:text-lamp-300 md:flex"
          >
            {copy.connect}
            <ArrowUpRight size={13} />
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            className="rounded-full border border-ink-700/70 p-2 text-bone-300 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-ink-700/60 bg-ink-950/95 px-6 py-5 md:hidden">
          <ul className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={handleNav(link.id)}
                  className="block font-mono text-xs uppercase tracking-[0.28em] text-bone-300"
                >
                  {copy.nav[link.labelKey]}
                </a>
              </li>
            ))}
            <li>
              <a
                href="mailto:contact.yuhan@gmail.com"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.22em] text-lamp-300"
              >
                {copy.connect}
                <ArrowUpRight size={13} />
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
