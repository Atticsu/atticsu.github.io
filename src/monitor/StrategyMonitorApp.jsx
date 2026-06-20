import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowUpRight,
  CalendarClock,
  Gauge,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import Grain from '../components/Grain';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Reveal from '../components/Reveal';

const DATA_BASE = (import.meta.env.VITE_MONITOR_DATA_BASE || '/monitor-data').replace(/\/$/, '');
const PIE_COLORS = ['#f5b056', '#5b8cff', '#fcd9a6', '#9a958a', '#3f6cdb', '#a6bfff', '#d7913a'];

const copyByLanguage = {
  en: {
    eyebrow: 'PRIVATE PAPER ACCOUNT',
    title: 'Strategy monitor',
    subtitle: 'Daily paper tracking for the current deployable research lead.',
    generated: 'Generated',
    updated: 'Latest data',
    refresh: 'Refresh',
    auth: 'Server protected',
    kpis: {
      equity: 'Equity',
      net: 'Net value',
      daily: 'Daily P&L',
      exposure: 'Gross exposure',
      drawdown: 'Current DD',
      sharpe: 'Full Sharpe-like',
    },
    tabs: {
      curve: 'Equity curve',
      positions: 'Positions',
      targets: 'Next targets',
      trades: 'Recent trades',
    },
    labels: {
      status: 'Status',
      benchmark: 'Benchmark',
      totalReturn: 'Total return',
      maxDd: 'Max DD',
      cost: 'Total cost',
      turnover: 'Annual turnover',
      holdings: 'Holdings',
      cash: 'Cash',
      rule: 'Rule',
      source: 'Source label',
      code: 'Code',
      asset: 'Asset',
      shares: 'Shares',
      close: 'Close',
      value: 'Value',
      weight: 'Weight',
      target: 'Target',
      side: 'Side',
      price: 'Price',
      notional: 'Notional',
      fee: 'Fee',
      empty: 'No rows',
      loading: 'Loading monitor feed',
      error: 'Unable to load monitor feed',
    },
  },
  zh: {
    eyebrow: '私有模拟盘',
    title: '策略监控台',
    subtitle: '当前可部署研究主线的每日模拟追踪。',
    generated: '生成时间',
    updated: '最新数据',
    refresh: '刷新',
    auth: '服务器侧保护',
    kpis: {
      equity: '当前权益',
      net: '净值',
      daily: '当日盈亏',
      exposure: '总仓位',
      drawdown: '当前回撤',
      sharpe: '全样本 Sharpe-like',
    },
    tabs: {
      curve: '权益曲线',
      positions: '当前持仓',
      targets: '目标仓位',
      trades: '近期交易',
    },
    labels: {
      status: '状态',
      benchmark: '基准',
      totalReturn: '累计收益',
      maxDd: '最大回撤',
      cost: '累计成本',
      turnover: '年化换手',
      holdings: '持仓数',
      cash: '现金',
      rule: '执行规则',
      source: '策略标签',
      code: '代码',
      asset: '资产',
      shares: '数量',
      close: '收盘',
      value: '市值',
      weight: '权重',
      target: '目标',
      side: '方向',
      price: '价格',
      notional: '成交额',
      fee: '费用',
      empty: '暂无记录',
      loading: '正在加载监控数据',
      error: '无法加载监控数据',
    },
  },
};

const formatCurrency = (value, currency = 'CNY') => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
};

const formatNumber = (value, digits = 3) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toFixed(digits);
};

const formatPct = (value, digits = 2) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return `${(Number(value) * 100).toFixed(digits)}%`;
};

const fetchJson = async (url) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return response.json();
};

const metricValue = (snapshot, key) => snapshot?.metrics?.[key] ?? null;
const latestValue = (snapshot, key) => snapshot?.latest?.[key] ?? snapshot?.latest?.[key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)] ?? null;

const Kpi = ({ icon: Icon, label, value, tone = 'bone' }) => (
  <div className="rounded-xl border border-ink-700/70 bg-ink-900/55 p-4">
    <div className="flex items-center justify-between gap-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone-500">{label}</p>
      <Icon size={15} className={tone === 'lamp' ? 'text-lamp-400' : 'text-bone-500'} />
    </div>
    <p className={`mt-4 font-mono text-xl ${tone === 'lamp' ? 'text-lamp-300' : 'text-bone-50'}`}>{value}</p>
  </div>
);

const StatusPill = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-lamp-500/35 bg-lamp-500/[0.08] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-lamp-300">
    <span className="h-1.5 w-1.5 rounded-full bg-lamp-400" aria-hidden="true" />
    {children}
  </span>
);

const StrategyMonitorApp = ({ language = 'en', setLanguage }) => {
  const copy = copyByLanguage[language] || copyByLanguage.en;
  const [index, setIndex] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const loaded = await fetchJson(`${DATA_BASE}/strategies/index.json`);
        if (!alive) return;
        setIndex(loaded);
        setSelectedId((current) => current || loaded?.strategies?.[0]?.id || '');
      } catch {
        if (alive) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, [reloadTick]);

  const selectedEntry = useMemo(
    () => index?.strategies?.find((item) => item.id === selectedId) || index?.strategies?.[0] || null,
    [index, selectedId]
  );

  useEffect(() => {
    if (!selectedEntry) return;
    let alive = true;
    setLoading(true);
    setError(false);
    (async () => {
      try {
        const [snapshot, equity, positions, targets, trades] = await Promise.all([
          fetchJson(`${DATA_BASE}/${selectedEntry.snapshotUrl}`),
          fetchJson(`${DATA_BASE}/${selectedEntry.equityUrl}`),
          fetchJson(`${DATA_BASE}/${selectedEntry.positionsUrl}`),
          fetchJson(`${DATA_BASE}/${selectedEntry.targetsUrl}`),
          fetchJson(`${DATA_BASE}/${selectedEntry.tradesUrl}`),
        ]);
        if (!alive) return;
        setBundle({ snapshot, equity, positions, targets, trades });
        setLoading(false);
      } catch {
        if (alive) {
          setError(true);
          setLoading(false);
        }
      }
    })();
    return () => { alive = false; };
  }, [selectedEntry]);

  const snapshot = bundle?.snapshot;
  const currency = snapshot?.currency || 'CNY';
  const positiveTargets = (bundle?.targets || []).filter((row) => Number(row.targetWeight) > 0);
  const latestDate = latestValue(snapshot, 'date') || selectedEntry?.latestDate || '—';

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950 text-bone-100 font-sans">
      <Grain />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink-700/60 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <a href="https://www.yuhanwu.cn/" className="flex items-center gap-2 text-bone-50">
            <span className="h-2.5 w-2.5 rounded-full bg-lamp-500 shadow-[0_0_18px_rgba(245,176,86,0.65)]" />
            <span className="font-display text-xl">Yuhan <span className="italic text-bone-400">Wu</span></span>
            <span className="ml-2 hidden font-mono text-[10px] uppercase tracking-[0.28em] text-bone-500 md:inline">Strategy Monitor</span>
          </a>
          <div className="flex items-center gap-3">
            <StatusPill>{copy.auth}</StatusPill>
            {setLanguage && <LanguageSwitcher language={language} setLanguage={setLanguage} />}
            <button
              type="button"
              onClick={() => setReloadTick((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-full border border-ink-700/70 bg-bone-50/[0.04] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-bone-300 transition-colors hover:border-lamp-500/70 hover:text-lamp-300"
            >
              <RefreshCcw size={13} />
              {copy.refresh}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-10 md:pt-36">
        <Reveal>
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-lamp-500">{copy.eyebrow}</p>
              <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] text-bone-50 md:text-7xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-bone-400 md:text-lg">
                {copy.subtitle}
              </p>
            </div>
            <div className="rounded-xl border border-ink-700/70 bg-ink-900/45 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {(index?.strategies || []).map((strategy) => (
                  <button
                    key={strategy.id}
                    type="button"
                    onClick={() => setSelectedId(strategy.id)}
                    className={`rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] transition-all ${
                      selectedEntry?.id === strategy.id
                        ? 'border-lamp-500/70 bg-lamp-500/[0.08] text-lamp-300'
                        : 'border-ink-700/70 text-bone-400 hover:border-bone-600 hover:text-bone-200'
                    }`}
                  >
                    {strategy.shortName || strategy.displayName}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone-500">{copy.generated}</p>
                  <p className="mt-2 font-mono text-bone-200">{snapshot?.generatedAt?.slice(0, 19).replace('T', ' ') || '—'}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone-500">{copy.updated}</p>
                  <p className="mt-2 font-mono text-lamp-300">{latestDate}</p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {loading && (
          <div className="mt-14 rounded-xl border border-ink-700/70 bg-ink-900/50 p-8 text-bone-400">{copy.labels.loading}</div>
        )}
        {error && (
          <div className="mt-14 rounded-xl border border-red-400/30 bg-red-500/[0.06] p-8 text-red-200">{copy.labels.error}</div>
        )}

        {!loading && !error && snapshot && (
          <>
            <Reveal delay={80}>
              <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <Kpi icon={WalletCards} label={copy.kpis.equity} value={formatCurrency(latestValue(snapshot, 'equity'), currency)} tone="lamp" />
                <Kpi icon={TrendingUp} label={copy.kpis.net} value={formatNumber(latestValue(snapshot, 'netValue') ?? latestValue(snapshot, 'net_value'), 4)} />
                <Kpi icon={Activity} label={copy.kpis.daily} value={formatCurrency(latestValue(snapshot, 'dailyPnl') ?? latestValue(snapshot, 'daily_pnl'), currency)} />
                <Kpi icon={Gauge} label={copy.kpis.exposure} value={formatPct(latestValue(snapshot, 'grossExposure') ?? latestValue(snapshot, 'gross_exposure'))} />
                <Kpi icon={ShieldCheck} label={copy.kpis.drawdown} value={formatPct(latestValue(snapshot, 'drawdown'))} />
                <Kpi icon={CalendarClock} label={copy.kpis.sharpe} value={formatNumber(metricValue(snapshot, 'sharpeLike'), 3)} />
              </section>
            </Reveal>

            <Reveal delay={120}>
              <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
                <div className="rounded-xl border border-ink-700/70 bg-ink-900/45 p-5 md:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{copy.tabs.curve}</p>
                      <h2 className="mt-2 font-display text-3xl text-bone-50">{snapshot.displayName}</h2>
                    </div>
                    <a
                      href="https://www.yuhanwu.cn/"
                      className="hidden items-center gap-2 rounded-full border border-ink-700/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-bone-400 hover:border-lamp-500/70 hover:text-lamp-300 md:inline-flex"
                    >
                      Main site
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                  <div className="mt-7 h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={bundle.equity} margin={{ top: 20, right: 22, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="monitorLampArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f5b056" stopOpacity={0.42} />
                            <stop offset="100%" stopColor="#f5b056" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" stroke="#22222e" vertical={false} />
                        <XAxis dataKey="date" stroke="#5a564e" tickLine={false} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                        <YAxis stroke="#5a564e" tickLine={false} tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} domain={['dataMin - 0.05', 'dataMax + 0.1']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(13,13,18,0.96)', border: '1px solid #22222e', borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: '#9a958a', fontFamily: 'JetBrains Mono' }}
                          formatter={(value, name) => [formatNumber(value, 4), name === 'netValue' ? 'Strategy' : snapshot.benchmark]}
                        />
                        <Area type="monotone" dataKey="netValue" stroke="#f5b056" strokeWidth={1.7} fill="url(#monitorLampArea)" />
                        <Line type="monotone" dataKey="benchmarkValue" stroke="#5b8cff" strokeWidth={1.2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <aside className="grid gap-4">
                  <div className="rounded-xl border border-ink-700/70 bg-ink-900/45 p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{copy.labels.status}</p>
                    <p className="mt-3 font-mono text-sm text-bone-100">{snapshot.status}</p>
                    <dl className="mt-5 grid gap-3 text-sm">
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.benchmark}</dt><dd className="font-mono text-bone-200">{snapshot.benchmark}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.totalReturn}</dt><dd className="font-mono text-lamp-300">{formatPct(metricValue(snapshot, 'totalReturn'))}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.maxDd}</dt><dd className="font-mono text-bone-200">{formatPct(metricValue(snapshot, 'maxDrawdown'))}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.cost}</dt><dd className="font-mono text-bone-200">{formatCurrency(metricValue(snapshot, 'totalCost'), currency)}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.turnover}</dt><dd className="font-mono text-bone-200">{formatNumber(metricValue(snapshot, 'annualTurnover'), 2)}x</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.holdings}</dt><dd className="font-mono text-bone-200">{latestValue(snapshot, 'holdingCount') ?? latestValue(snapshot, 'holding_count')}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.cash}</dt><dd className="font-mono text-bone-200">{formatCurrency(latestValue(snapshot, 'cash'), currency)}</dd></div>
                    </dl>
                  </div>
                  <div className="rounded-xl border border-ink-700/70 bg-ink-900/45 p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{copy.labels.source}</p>
                    <p className="mt-3 text-sm leading-relaxed text-bone-300">{snapshot.publicLabel}</p>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-bone-500">{copy.labels.rule}</p>
                    <p className="mt-2 text-sm leading-relaxed text-bone-400">{snapshot.executionRule}</p>
                  </div>
                </aside>
              </section>
            </Reveal>

            <Reveal delay={160}>
              <section className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-xl border border-ink-700/70 bg-ink-900/45 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{copy.tabs.positions}</p>
                  <div className="mt-5 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={bundle.positions} dataKey="weight" nameKey="tsCode" innerRadius={56} outerRadius={88} paddingAngle={2} stroke="none">
                          {bundle.positions.map((entry, index) => <Cell key={entry.tsCode} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(13,13,18,0.96)', border: '1px solid #22222e', borderRadius: 8 }} formatter={(value) => formatPct(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-4 grid gap-2 font-mono text-[11px] text-bone-400">
                    {bundle.positions.map((position, index) => (
                      <li key={position.tsCode} className="flex items-center justify-between rounded-lg border border-ink-700/60 bg-ink-800/35 px-3 py-2">
                        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />{position.tsCode}</span>
                        <span>{formatPct(position.weight)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="overflow-hidden rounded-xl border border-ink-700/70 bg-ink-900/45">
                  <div className="border-b border-ink-700/60 bg-ink-800/50 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{copy.tabs.positions}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone-500">
                        <tr className="border-b border-ink-700/60">
                          <th className="px-4 py-3 font-normal">{copy.labels.code}</th>
                          <th className="px-4 py-3 font-normal">{copy.labels.shares}</th>
                          <th className="px-4 py-3 font-normal">{copy.labels.close}</th>
                          <th className="px-4 py-3 font-normal">{copy.labels.value}</th>
                          <th className="px-4 py-3 font-normal">{copy.labels.weight}</th>
                          <th className="px-4 py-3 font-normal">{copy.labels.target}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-700/45">
                        {bundle.positions.length ? bundle.positions.map((position) => (
                          <tr key={position.tsCode} className="hover:bg-ink-800/35">
                            <td className="px-4 py-3 font-mono text-lamp-300">{position.tsCode}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{position.shares}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{formatNumber(position.close, 3)}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{formatCurrency(position.marketValue, currency)}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{formatPct(position.weight)}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{formatPct(position.targetWeight)}</td>
                          </tr>
                        )) : <tr><td colSpan={6} className="px-4 py-4 text-bone-500">{copy.labels.empty}</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </Reveal>

            <Reveal delay={200}>
              <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <DataTable title={copy.tabs.targets} rows={positiveTargets} empty={copy.labels.empty} columns={[
                  [copy.labels.code, (row) => row.tsCode, 'text-lamp-300'],
                  [copy.labels.asset, (row) => row.assetType],
                  [copy.labels.target, (row) => formatPct(row.targetWeight)],
                  ['Signal', (row) => row.signalDate],
                ]} />
                <DataTable title={copy.tabs.trades} rows={(bundle.trades || []).slice().reverse().slice(0, 12)} empty={copy.labels.empty} columns={[
                  ['Date', (row) => row.date],
                  [copy.labels.code, (row) => row.tsCode, 'text-lamp-300'],
                  [copy.labels.side, (row) => row.side],
                  [copy.labels.shares, (row) => row.shares],
                  [copy.labels.notional, (row) => formatCurrency(row.notional, currency)],
                  [copy.labels.fee, (row) => formatCurrency((row.commission || 0) + (row.stampDuty || 0), currency)],
                ]} />
              </section>
            </Reveal>
          </>
        )}
      </main>
    </div>
  );
};

const DataTable = ({ title, rows, columns, empty }) => (
  <div className="overflow-hidden rounded-xl border border-ink-700/70 bg-ink-900/45">
    <div className="border-b border-ink-700/60 bg-ink-800/50 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{title}</div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone-500">
          <tr className="border-b border-ink-700/60">
            {columns.map(([label]) => <th key={label} className="px-4 py-3 font-normal">{label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-700/45">
          {rows.length ? rows.map((row, idx) => (
            <tr key={`${title}-${idx}`} className="hover:bg-ink-800/35">
              {columns.map(([label, getValue, className = 'text-bone-300']) => (
                <td key={label} className={`px-4 py-3 font-mono ${className}`}>{getValue(row)}</td>
              ))}
            </tr>
          )) : <tr><td colSpan={columns.length} className="px-4 py-4 text-bone-500">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

export default StrategyMonitorApp;
