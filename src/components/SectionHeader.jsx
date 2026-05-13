import React from 'react';
import Reveal from './Reveal';

const SectionHeader = ({ number, kicker, title, intro, align = 'left' }) => {
  const alignment = align === 'center' ? 'items-center text-center' : 'items-start text-left';
  return (
    <div className={`flex flex-col ${alignment} max-w-3xl ${align === 'center' ? 'mx-auto' : ''}`}>
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.32em] text-lamp-500 uppercase mb-6">
          <span className="text-lamp-400">{number}</span>
          <span className="mx-3 text-ink-700">—</span>
          <span className="text-bone-400">{kicker}</span>
        </p>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="font-display text-5xl md:text-7xl text-bone-50 leading-[0.95] tracking-mega">
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={160}>
          <p className="mt-8 text-lg md:text-xl text-bone-400 leading-relaxed max-w-2xl font-light">
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
};

export default SectionHeader;
