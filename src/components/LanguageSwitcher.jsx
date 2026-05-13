import React, { useEffect, useRef, useState } from 'react';
import { Languages } from 'lucide-react';
import { LANGUAGE_OPTIONS, uiText } from '../i18n';

const LanguageSwitcher = ({ language, setLanguage, compact = false }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const copy = uiText[language] || uiText.en;
  const activeOption = LANGUAGE_OPTIONS.find((opt) => opt.id === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-full border border-ink-700/70 bg-ink-900/60 px-3 py-1.5 text-xs text-bone-400 transition-colors hover:text-bone-50 hover:border-lamp-500/50 ${
          compact ? '' : 'backdrop-blur-md'
        }`}
        aria-label="Switch language"
      >
        <Languages size={14} className="text-lamp-500" />
        <span className="font-mono tracking-wider">{activeOption.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-ink-700/80 bg-ink-900/95 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl z-50">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-lamp-500">
                {copy.languagePanelTitle}
              </p>
              <p className="mt-1.5 text-xs text-bone-500 leading-relaxed">
                {copy.languagePanelDesc}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = language === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => {
                    setLanguage(opt.id);
                    setOpen(false);
                  }}
                  className={`group flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                    active
                      ? 'border-lamp-500/60 bg-lamp-500/[0.06] text-bone-50'
                      : 'border-ink-700/70 bg-ink-800/40 text-bone-400 hover:border-bone-600/70 hover:text-bone-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[10px] font-mono ${
                        active ? 'border-lamp-500/70 text-lamp-300' : 'border-ink-700 text-bone-500'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span className="text-sm font-medium">{opt.name}</span>
                  </div>
                  <p className="text-[11px] leading-snug text-bone-500">{opt.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
