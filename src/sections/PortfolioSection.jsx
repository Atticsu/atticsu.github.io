import React, { useEffect, useState } from 'react';
import { Database, ExternalLink, ArrowUpRight } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Reveal from '../components/Reveal';
import { portfolioCopy, tableHeaders } from '../i18n';
import { parsePortfolioCsv } from '../lib/csv';

const PORTFOLIO_DATA_URL = '/data/portfolio.csv';

const PortfolioSection = ({ language }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const copy = portfolioCopy[language] || portfolioCopy.en;
  const headers = tableHeaders[language] || tableHeaders.en;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(PORTFOLIO_DATA_URL);
        if (!r.ok) throw new Error('Failed to load');
        const text = await r.text();
        const parsed = parsePortfolioCsv(text);
        if (alive) {
          setPortfolio(parsed);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (alive) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalWeight = portfolio.reduce((s, p) => s + (p.weight || 0), 0);
  const noHoldings = !loading && !error && portfolio.length === 0;

  return (
    <section id="portfolio" className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink-700/80 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader number={copy.number} kicker={copy.kicker} title={copy.title} intro={copy.subtitle} />
          <Reveal delay={200}>
            <a
              href={PORTFOLIO_DATA_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-bone-100/15 bg-bone-50/[0.04] px-5 py-2.5 text-xs font-mono uppercase tracking-[0.28em] text-bone-100 transition-all hover:border-lamp-500/70 hover:bg-lamp-500/[0.08] hover:text-lamp-300"
            >
              <Database size={14} />
              {copy.openCsv}
              <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="mt-20 flex items-baseline justify-between border-t border-ink-700/70 pt-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone-500">
              {copy.totalWeight}
            </p>
            <p className="font-display text-5xl md:text-6xl text-lamp-300 leading-none drop-shadow-[0_0_24px_rgba(245,176,86,0.25)]">
              {totalWeight}<span className="text-bone-600 text-3xl md:text-4xl">%</span>
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {loading &&
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-44 rounded-2xl border border-ink-700/60 bg-ink-900/40 animate-pulse" />
            ))}
          {error && (
            <div className="md:col-span-2 rounded-2xl border border-red-700/40 bg-red-900/10 p-5 text-sm text-red-200">
              {copy.loadingError}
            </div>
          )}
          {noHoldings && (
            <div className="md:col-span-2 rounded-2xl border border-ink-700/60 bg-ink-900/40 p-6 text-sm text-bone-400">
              {copy.empty}
            </div>
          )}
          {!loading && !error && portfolio.map((pos, idx) => (
            <Reveal key={`${pos.ticker}-${idx}`} delay={Math.min(idx * 70, 420)}>
              <article className="group relative h-full rounded-2xl border border-ink-700/70 bg-ink-900/40 p-6 transition-all hover:border-lamp-500/40 hover:bg-ink-900/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-lamp-500">
                      {pos.ticker}
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-bone-50 leading-tight">
                      {pos.name || pos.ticker}
                    </h3>
                  </div>
                  <p className="font-display text-3xl text-bone-100 leading-none">
                    {pos.weight}<span className="text-bone-600 text-lg">%</span>
                  </p>
                </div>
                <p className="mt-5 text-sm text-bone-400 leading-relaxed">
                  {pos.reason || copy.noReason}
                </p>
                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-bone-600">
                  {copy.imported} · {copy.cardSource}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-16 overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900/40">
            <div className="flex items-center justify-between border-b border-ink-700/60 bg-ink-800/60 px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone-500">
                {copy.selectLabel}
              </span>
              <ExternalLink size={12} className="text-bone-600" />
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-700/60 font-mono text-[11px] uppercase tracking-[0.22em] text-bone-500">
                  <th className="px-5 py-3 font-normal">{headers.ticker}</th>
                  <th className="px-5 py-3 font-normal">{headers.asset}</th>
                  <th className="px-5 py-3 font-normal text-right">{headers.weight}</th>
                  <th className="px-5 py-3 font-normal">{headers.reason}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-700/40">
                {portfolio.map((pos, idx) => (
                  <tr key={`${pos.ticker}-${idx}`} className="group transition-colors hover:bg-ink-800/50">
                    <td className="px-5 py-3 font-mono text-lamp-300">{pos.ticker}</td>
                    <td className="px-5 py-3 text-bone-200">{pos.name}</td>
                    <td className="px-5 py-3 text-right font-mono text-bone-400">{pos.weight}%</td>
                    <td className="px-5 py-3 text-bone-400 leading-relaxed">{pos.reason}</td>
                  </tr>
                ))}
                {portfolio.length === 0 && (
                  <tr>
                    <td className="px-5 py-3 text-bone-500" colSpan={4}>
                      {copy.awaiting}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-ink-800/40 font-mono text-[11px] uppercase tracking-[0.22em] text-bone-500">
                  <td className="px-5 py-3" colSpan={4}>
                    {copy.totalWeight}: <span className="text-lamp-300">{totalWeight}%</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PortfolioSection;
