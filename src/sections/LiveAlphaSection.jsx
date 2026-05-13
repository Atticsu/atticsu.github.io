import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { ExternalLink } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import Reveal from '../components/Reveal';
import { netValuesCopy, portfolioCopy, tableHeaders, chartRangeLabels } from '../i18n';
import { parsePortfolioCsv, parseNetValuesCsv, filterNetValuesByRange } from '../lib/csv';

const NET_VALUES_DATA_URL = '/data/net_values.csv';
const PORTFOLIO_DATA_URL = '/data/portfolio.csv';

const PIE_COLORS = ['#5b8cff', '#f5b056', '#2c4a8a', '#9a958a', '#fcd9a6', '#3f6cdb'];

const LiveAlphaSection = ({ language }) => {
  const [chartRange, setChartRange] = useState('1Y');
  const [netValues, setNetValues] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loadingNet, setLoadingNet] = useState(true);
  const [netError, setNetError] = useState(false);

  const [portfolio, setPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState(false);

  const copy = netValuesCopy[language] || netValuesCopy.en;
  const headers = tableHeaders[language] || tableHeaders.en;
  const ranges = chartRangeLabels[language] || chartRangeLabels.en;
  const portfolioLabel = (portfolioCopy[language] || portfolioCopy.en).selectLabel;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(NET_VALUES_DATA_URL);
        if (!r.ok) throw new Error();
        const text = await r.text();
        const parsed = parseNetValuesCsv(text);
        if (alive) {
          setNetValues(parsed);
          setLoadingNet(false);
        }
      } catch {
        if (alive) {
          setNetError(true);
          setLoadingNet(false);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setChartData(filterNetValuesByRange(netValues, chartRange));
  }, [netValues, chartRange]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(PORTFOLIO_DATA_URL);
        if (!r.ok) throw new Error();
        const text = await r.text();
        const parsed = parsePortfolioCsv(text);
        if (alive) {
          setPortfolio(parsed);
          setLoadingPortfolio(false);
        }
      } catch {
        if (alive) {
          setPortfolioError(true);
          setLoadingPortfolio(false);
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  const latestPoint = chartData.length
    ? chartData[chartData.length - 1]
    : netValues[netValues.length - 1] || null;
  const piePositions = portfolio.filter((p) => p.weight > 0);

  return (
    <section id="live" className="relative px-6 py-32 md:px-12 md:py-48">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink-700/80 to-transparent" />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            number={copy.number}
            kicker={copy.kicker}
            title={copy.title}
            intro={copy.source}
          />
          <Reveal delay={200}>
            <div className="text-right">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-bone-500">
                {copy.latestLabel}
              </p>
              <p className="mt-3 font-display text-6xl md:text-7xl text-lamp-300 leading-none drop-shadow-[0_0_28px_rgba(245,176,86,0.35)]">
                {latestPoint?.value ? latestPoint.value.toFixed(4) : '—'}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone-500">
                {latestPoint?.date || copy.waiting}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="mt-20 rounded-3xl border border-ink-700/70 bg-ink-900/40 p-6 md:p-10 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-lamp-glow" />
            <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-lamp-500">
                  {copy.performanceTag}
                </p>
                <h3 className="mt-2 font-display text-3xl text-bone-50 leading-tight">
                  {copy.chartTitle}
                </h3>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-bone-500">
                  {copy.chartBadge}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {ranges.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setChartRange(r.key)}
                    className={`rounded-full border px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] transition-all ${
                      chartRange === r.key
                        ? 'border-lamp-500/70 bg-lamp-500/[0.08] text-lamp-300'
                        : 'border-ink-700/70 text-bone-400 hover:border-bone-600 hover:text-bone-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-8 h-[320px]">
              {loadingNet && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-bone-500">
                  {copy.loading}
                </div>
              )}
              {netError && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-red-300">
                  {copy.error}
                </div>
              )}
              {!loadingNet && !netError && !chartData.length && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-bone-500">
                  {copy.empty}
                </div>
              )}
              {!loadingNet && !netError && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 24, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lampArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f5b056" stopOpacity={0.55} />
                        <stop offset="100%" stopColor="#f5b056" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="#22222e" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#5a564e"
                      tickLine={false}
                      axisLine={{ stroke: '#22222e' }}
                      tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis
                      stroke="#5a564e"
                      tickLine={false}
                      axisLine={{ stroke: '#22222e' }}
                      tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }}
                      domain={['dataMin - 0.05', 'dataMax + 0.05']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(13,13,18,0.95)',
                        border: '1px solid #22222e',
                        borderRadius: '12px',
                        fontSize: '12px',
                        padding: '10px 12px',
                        backdropFilter: 'blur(8px)',
                      }}
                      labelStyle={{ color: '#9a958a', marginBottom: 4, fontFamily: 'JetBrains Mono' }}
                      itemStyle={{ color: '#fcd9a6' }}
                      formatter={(value) => [Number(value).toFixed(4), copy.tooltipLabel]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f5b056"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#lampArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-12">
            <div className="md:col-span-5 rounded-3xl border border-ink-700/70 bg-ink-900/40 p-6 md:p-8 relative overflow-hidden">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-lamp-500">
                {copy.allocation}
              </p>
              <div className="mt-4 h-[220px]">
                {loadingPortfolio ? (
                  <div className="flex h-full items-center justify-center text-sm text-bone-500">
                    {copy.portfolioLoading}
                  </div>
                ) : portfolioError ? (
                  <div className="flex h-full items-center justify-center text-sm text-red-300">
                    {copy.portfolioError}
                  </div>
                ) : piePositions.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={piePositions}
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={84}
                        paddingAngle={2}
                        dataKey="weight"
                        stroke="none"
                      >
                        {piePositions.map((entry, index) => (
                          <Cell key={`cell-${entry.ticker}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(13,13,18,0.95)',
                          border: '1px solid #22222e',
                          borderRadius: '10px',
                          fontSize: '12px',
                        }}
                        labelStyle={{ color: '#9a958a' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-bone-500">
                    {copy.noWeights}
                  </div>
                )}
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-mono text-bone-400">
                {piePositions.map((p, idx) => (
                  <li key={`${p.ticker}-${idx}`} className="flex items-center justify-between rounded-md border border-ink-700/60 bg-ink-800/40 px-2 py-1">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      {p.ticker}
                    </span>
                    <span>{p.weight}%</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-7 overflow-hidden rounded-3xl border border-ink-700/70 bg-ink-900/40">
              <div className="flex items-center justify-between border-b border-ink-700/60 bg-ink-800/60 px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-bone-500">
                  {portfolioLabel}
                </span>
                <ExternalLink size={12} className="text-bone-600" />
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-700/60 font-mono text-[11px] uppercase tracking-[0.22em] text-bone-500">
                    <th className="px-5 py-3 font-normal">{headers.ticker}</th>
                    <th className="px-5 py-3 font-normal">{headers.asset}</th>
                    <th className="px-5 py-3 font-normal text-right">{headers.weight}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-700/40">
                  {loadingPortfolio && (
                    <tr><td className="px-5 py-3 text-bone-500" colSpan={3}>{copy.portfolioLoading}</td></tr>
                  )}
                  {portfolioError && (
                    <tr><td className="px-5 py-3 text-red-300" colSpan={3}>{copy.portfolioError}</td></tr>
                  )}
                  {!loadingPortfolio && !portfolioError && portfolio.map((pos, idx) => (
                    <tr key={`${pos.ticker}-${idx}`} className="transition-colors hover:bg-ink-800/50">
                      <td className="px-5 py-3 font-mono text-lamp-300">{pos.ticker}</td>
                      <td className="px-5 py-3 text-bone-200">{pos.name}</td>
                      <td className="px-5 py-3 text-right font-mono text-bone-400">{pos.weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-48 bg-gradient-to-t from-ink-950 to-transparent" />
    </section>
  );
};

export default LiveAlphaSection;
