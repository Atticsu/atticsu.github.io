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
  ListChecks,
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

const rangePresets = [
  { key: 'all', months: null },
  { key: 'ytd', months: 'ytd' },
  { key: '1y', months: 12 },
  { key: '6m', months: 6 },
  { key: '3m', months: 3 },
];

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
      pendingOrders: 'Pending orders',
      orders: 'Recent orders',
      trades: 'Recent trades',
      broker: 'Paper broker',
    },
    range: {
      title: 'Selected range',
      start: 'Start',
      end: 'End',
      rangeReturn: 'Range gain (end - start)',
      relativeReturn: 'Range return',
      pnl: 'P&L',
      presets: {
        all: 'ALL',
        ytd: 'YTD',
        '1y': '1Y',
        '6m': '6M',
        '3m': '3M',
      },
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
      name: 'Name',
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
      signal: 'Signal',
      exec: 'Exec',
      desired: 'Desired',
      ordered: 'Ordered',
      reason: 'Reason',
      mode: 'Mode',
      sourceEnd: 'Source end',
      latestTarget: 'Latest target',
      nativeTarget: 'Native signal',
      latestPrice: 'Latest price',
      targetFreshness: 'Target freshness',
      signalFreshness: 'Signal freshness',
      targetRefreshMode: 'Target refresh',
      stale: 'Stale target stream',
      staleSignal: 'Native signal stale',
      current: 'Current',
      pending: 'Pending',
      orders: 'Orders',
      priceSource: 'Price source',
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
      pendingOrders: '待执行订单',
      orders: '最近订单',
      trades: '近期交易',
      broker: '模拟撮合',
    },
    range: {
      title: '所选区间',
      start: '开始',
      end: '结束',
      rangeReturn: '区间收益（末日-起日）',
      relativeReturn: '区间收益率',
      pnl: '区间盈亏',
      presets: {
        all: '全部',
        ytd: '今年',
        '1y': '1年',
        '6m': '6月',
        '3m': '3月',
      },
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
      name: '名称',
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
      signal: '信号日',
      exec: '执行日',
      desired: '目标股数',
      ordered: '订单股数',
      reason: '原因',
      mode: '模式',
      sourceEnd: '源 run 截止',
      latestTarget: '最新目标',
      nativeTarget: '原生信号',
      latestPrice: '最新行情',
      targetFreshness: '目标新鲜度',
      signalFreshness: '信号新鲜度',
      targetRefreshMode: '目标刷新',
      stale: '目标流已落后',
      staleSignal: '原生信号落后',
      current: '当前',
      pending: '待执行',
      orders: '订单数',
      priceSource: '价格来源',
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

const toIsoDate = (date) => date.toISOString().slice(0, 10);

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
  const [manualSheet, setManualSheet] = useState(null);
  const [manualError, setManualError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [equityStartDate, setEquityStartDate] = useState('');
  const [equityEndDate, setEquityEndDate] = useState('');

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

  useEffect(() => {
    let alive = true;
    setManualError(false);
    (async () => {
      try {
        const loaded = await fetchJson(`${DATA_BASE}/manual-trading/hs_macro_semichip_m0.json`);
        if (alive) setManualSheet(loaded);
      } catch {
        if (alive) setManualError(true);
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
        const [snapshot, equity, positions, targets, trades, orders, pendingOrders] = await Promise.all([
          fetchJson(`${DATA_BASE}/${selectedEntry.snapshotUrl}`),
          fetchJson(`${DATA_BASE}/${selectedEntry.equityUrl}`),
          fetchJson(`${DATA_BASE}/${selectedEntry.positionsUrl}`),
          fetchJson(`${DATA_BASE}/${selectedEntry.targetsUrl}`),
          fetchJson(`${DATA_BASE}/${selectedEntry.tradesUrl}`),
          selectedEntry.ordersUrl ? fetchJson(`${DATA_BASE}/${selectedEntry.ordersUrl}`) : Promise.resolve([]),
          selectedEntry.pendingOrdersUrl ? fetchJson(`${DATA_BASE}/${selectedEntry.pendingOrdersUrl}`) : Promise.resolve([]),
        ]);
        if (!alive) return;
        setBundle({ snapshot, equity, positions, targets, trades, orders, pendingOrders });
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
  const paper = snapshot?.paper || {};
  const currency = snapshot?.currency || 'CNY';
  const equityRows = bundle?.equity || [];
  const firstEquityDate = equityRows[0]?.date || '';
  const lastEquityDate = equityRows[equityRows.length - 1]?.date || '';
  const positiveTargets = (bundle?.targets || []).filter((row) => Number(row.targetWeight) > 0);
  const pendingOrders = bundle?.pendingOrders || [];
  const orders = bundle?.orders || [];
  const manualRows = manualSheet?.holdings || [];
  const latestDate = latestValue(snapshot, 'date') || selectedEntry?.latestDate || '—';

  useEffect(() => {
    if (!firstEquityDate || !lastEquityDate) return;
    setEquityStartDate(firstEquityDate);
    setEquityEndDate(lastEquityDate);
  }, [selectedEntry?.id, firstEquityDate, lastEquityDate]);

  const selectedEquity = useMemo(() => {
    if (!equityRows.length) return [];
    const start = equityStartDate || firstEquityDate;
    const end = equityEndDate || lastEquityDate;
    const rows = equityRows.filter((row) => row.date >= start && row.date <= end);
    return rows.length ? rows : equityRows;
  }, [equityRows, equityStartDate, equityEndDate, firstEquityDate, lastEquityDate]);

  const rangeStats = useMemo(() => {
    if (!selectedEquity.length) return null;
    const start = selectedEquity[0];
    const end = selectedEquity[selectedEquity.length - 1];
    const startNet = Number(start.netValue);
    const endNet = Number(end.netValue);
    const startEquity = Number(start.equity);
    const endEquity = Number(end.equity);
    return {
      startDate: start.date,
      endDate: end.date,
      netChange: endNet - startNet,
      relativeReturn: startNet ? endNet / startNet - 1 : null,
      pnl: endEquity - startEquity,
      points: selectedEquity.length,
    };
  }, [selectedEquity]);

  const applyRangePreset = (preset) => {
    if (!firstEquityDate || !lastEquityDate) return;
    if (preset.months === null) {
      setEquityStartDate(firstEquityDate);
      setEquityEndDate(lastEquityDate);
      return;
    }
    const end = lastEquityDate;
    let start = firstEquityDate;
    if (preset.months === 'ytd') {
      start = `${end.slice(0, 4)}-01-01`;
    } else {
      const date = new Date(`${end}T00:00:00`);
      date.setMonth(date.getMonth() - Number(preset.months));
      start = toIsoDate(date);
    }
    const firstInRange = equityRows.find((row) => row.date >= start)?.date || firstEquityDate;
    setEquityStartDate(firstInRange);
    setEquityEndDate(end);
  };

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
        <aside className="fixed left-4 top-28 z-40 hidden w-40 rounded-xl border border-ink-700/70 bg-ink-950/80 p-3 backdrop-blur-xl 2xl:block">
          <nav className="grid gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
            <a href="#manual-orders" className="rounded-lg border border-lamp-500/40 bg-lamp-500/[0.08] px-3 py-2 text-lamp-300 hover:border-lamp-500/80">
              Manual HS
            </a>
            <a href="#strategy-monitor" className="rounded-lg border border-ink-700/70 px-3 py-2 text-bone-400 hover:border-bone-600 hover:text-bone-200">
              Monitor
            </a>
          </nav>
        </aside>
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

            <Reveal delay={110}>
              <section id="manual-orders" className="mt-6 scroll-mt-28 rounded-xl border border-lamp-500/30 bg-lamp-500/[0.045] p-5 md:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">Manual Tonghuashun Sheet</p>
                    <h2 className="mt-2 font-display text-3xl text-bone-50">meta_gcap_macro_semichip_weak_or_tight_m0</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-bone-300">
                      {manualSheet?.signal?.headline || (manualError ? 'Manual sheet is unavailable.' : 'Loading manual sheet.')}
                    </p>
                  </div>
                  <div className="grid min-w-[260px] gap-2 rounded-lg border border-ink-700/70 bg-ink-950/40 p-3 font-mono text-xs">
                    <div className="flex justify-between gap-4"><span className="text-bone-500">Capital</span><span className="text-bone-100">{formatCurrency(manualSheet?.account?.capital, manualSheet?.account?.currency || currency)}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-bone-500">Signal</span><span className="text-bone-100">{manualSheet?.signal?.nativeSignalDate || '—'}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-bone-500">Planned open</span><span className="text-lamp-300">{manualSheet?.signal?.plannedOpenDate || '—'}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-bone-500">Executable</span><span className={manualSheet?.signal?.hasExecutableOrder ? 'text-lamp-300' : 'text-bone-300'}>{manualSheet?.signal?.hasExecutableOrder ? 'YES' : 'NO'}</span></div>
                  </div>
                </div>
                <div className="mt-5 overflow-x-auto rounded-lg border border-ink-700/70 bg-ink-950/35">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="font-mono text-[10px] uppercase tracking-[0.20em] text-bone-500">
                      <tr className="border-b border-ink-700/60">
                        <th className="px-4 py-3 font-normal">Code</th>
                        <th className="px-4 py-3 font-normal">Name</th>
                        <th className="px-4 py-3 font-normal">Target</th>
                        <th className="px-4 py-3 font-normal">Target Value</th>
                        <th className="px-4 py-3 font-normal">Last Close</th>
                        <th className="px-4 py-3 font-normal">Current</th>
                        <th className="px-4 py-3 font-normal">Hold Shares</th>
                        <th className="px-4 py-3 font-normal">Order</th>
                        <th className="px-4 py-3 font-normal">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-700/45">
                      {manualRows.length ? manualRows.map((row) => (
                        <tr key={row.tsCode} className="hover:bg-ink-800/35">
                          <td className="px-4 py-3 font-mono text-lamp-300">{row.tsCode}</td>
                          <td className="px-4 py-3 text-bone-200">{row.name || '—'}</td>
                          <td className="px-4 py-3 font-mono text-bone-300">{formatPct(row.targetWeight)}</td>
                          <td className="px-4 py-3 font-mono text-bone-300">{formatCurrency(row.targetValue, manualSheet?.account?.currency || currency)}</td>
                          <td className="px-4 py-3 font-mono text-bone-300">{formatNumber(row.lastClose, 3)}</td>
                          <td className="px-4 py-3 font-mono text-bone-300">{row.currentShares}</td>
                          <td className="px-4 py-3 font-mono text-bone-50">{row.desiredShares}</td>
                          <td className="px-4 py-3 font-mono text-bone-50">{row.orderShares}</td>
                          <td className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-bone-400">{row.tradeAction}</td>
                        </tr>
                      )) : <tr><td colSpan={9} className="px-4 py-4 text-bone-500">{copy.labels.empty}</td></tr>}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-bone-500">
                  First manual run assumes zero current shares. Refresh before 08:00 each trading day, then place only listed board-lot orders in Tonghuashun simulation.
                </p>
              </section>
            </Reveal>

            <Reveal delay={120}>
              <section id="strategy-monitor" className="mt-6 grid scroll-mt-28 gap-6 lg:grid-cols-[1.5fr_0.85fr]">
                <div className="rounded-xl border border-ink-700/70 bg-ink-900/45 p-5 md:p-7">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{copy.tabs.curve}</p>
                      <h2 className="mt-2 font-display text-3xl text-bone-50">{snapshot.displayName}</h2>
                    </div>
                    <div className="grid gap-3 rounded-lg border border-ink-700/70 bg-ink-950/35 p-3 xl:min-w-[420px]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone-500">{copy.range.title}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {rangePresets.map((preset) => (
                            <button
                              key={preset.key}
                              type="button"
                              onClick={() => applyRangePreset(preset)}
                              className="rounded-full border border-ink-700/70 px-2.5 py-1 font-mono text-[10px] text-bone-300 hover:border-lamp-500/70 hover:text-lamp-300"
                            >
                              {copy.range.presets[preset.key]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="grid gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-500">
                          {copy.range.start}
                          <input
                            type="date"
                            min={firstEquityDate}
                            max={equityEndDate || lastEquityDate}
                            value={equityStartDate}
                            onChange={(event) => {
                              const value = event.target.value;
                              setEquityStartDate(value);
                              if (equityEndDate && value > equityEndDate) setEquityEndDate(value);
                            }}
                            className="h-9 rounded-md border border-ink-700 bg-ink-950 px-2 font-mono text-xs text-bone-200 outline-none focus:border-lamp-500/70"
                          />
                        </label>
                        <label className="grid gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-bone-500">
                          {copy.range.end}
                          <input
                            type="date"
                            min={equityStartDate || firstEquityDate}
                            max={lastEquityDate}
                            value={equityEndDate}
                            onChange={(event) => setEquityEndDate(event.target.value)}
                            className="h-9 rounded-md border border-ink-700 bg-ink-950 px-2 font-mono text-xs text-bone-200 outline-none focus:border-lamp-500/70"
                          />
                        </label>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-500">{copy.range.rangeReturn}</p>
                          <p className="mt-1 font-mono text-base text-lamp-300">{formatPct(rangeStats?.netChange)}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-500">{copy.range.relativeReturn}</p>
                          <p className="mt-1 font-mono text-base text-bone-100">{formatPct(rangeStats?.relativeReturn)}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-500">{copy.range.pnl}</p>
                          <p className="mt-1 font-mono text-base text-bone-100">{formatCurrency(rangeStats?.pnl, currency)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-7 h-[360px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={selectedEquity} margin={{ top: 20, right: 22, left: 0, bottom: 0 }}>
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
                  <div className="rounded-xl border border-ink-700/70 bg-ink-900/45 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{copy.tabs.broker}</p>
                      <ListChecks size={15} className="text-bone-500" />
                    </div>
                    <dl className="mt-5 grid gap-3 text-sm">
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.mode}</dt><dd className="font-mono text-bone-200">{paper.mode || '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.sourceEnd}</dt><dd className="font-mono text-bone-200">{paper.sourceEndDate || '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.latestTarget}</dt><dd className="font-mono text-bone-200">{paper.latestTargetDate || '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.nativeTarget}</dt><dd className="font-mono text-bone-200">{paper.nativeLatestTargetDate || '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.latestPrice}</dt><dd className="font-mono text-bone-200">{paper.latestPriceDate || '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.targetFreshness}</dt><dd className={`font-mono ${paper.targetStreamStale ? 'text-lamp-300' : 'text-bone-200'}`}>{paper.targetStreamStale ? copy.labels.stale : copy.labels.current}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.signalFreshness}</dt><dd className={`font-mono ${paper.nativeSignalStale ? 'text-lamp-300' : 'text-bone-200'}`}>{paper.nativeSignalStale ? copy.labels.staleSignal : copy.labels.current}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.targetRefreshMode}</dt><dd className="font-mono text-bone-200">{paper.targetRefresh?.mode || '—'}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.pending}</dt><dd className="font-mono text-bone-200">{pendingOrders.length}</dd></div>
                      <div className="flex justify-between gap-4"><dt className="text-bone-500">{copy.labels.orders}</dt><dd className="font-mono text-bone-200">{paper.orders ?? orders.length}</dd></div>
                    </dl>
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
                        <Pie data={bundle.positions} dataKey="weight" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={2} stroke="none">
                          {bundle.positions.map((entry, index) => <Cell key={entry.tsCode} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(13,13,18,0.96)', border: '1px solid #22222e', borderRadius: 8 }} formatter={(value) => formatPct(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-4 grid gap-2 font-mono text-[11px] text-bone-400">
                    {bundle.positions.map((position, index) => (
                      <li key={position.tsCode} className="flex items-center justify-between rounded-lg border border-ink-700/60 bg-ink-800/35 px-3 py-2">
                        <span className="flex min-w-0 items-center gap-2"><span className="h-1.5 w-1.5 flex-none rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} /><span className="truncate">{position.tsCode} {position.name || ''}</span></span>
                        <span>{formatPct(position.weight)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="overflow-hidden rounded-xl border border-ink-700/70 bg-ink-900/45">
                  <div className="border-b border-ink-700/60 bg-ink-800/50 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.24em] text-lamp-500">{copy.tabs.positions}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                      <thead className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone-500">
                        <tr className="border-b border-ink-700/60">
                          <th className="px-4 py-3 font-normal">{copy.labels.code}</th>
                          <th className="px-4 py-3 font-normal">{copy.labels.name}</th>
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
                            <td className="px-4 py-3 text-bone-200">{position.name || '—'}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{position.shares}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{formatNumber(position.close, 3)}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{formatCurrency(position.marketValue, currency)}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{formatPct(position.weight)}</td>
                            <td className="px-4 py-3 font-mono text-bone-300">{formatPct(position.targetWeight)}</td>
                          </tr>
                        )) : <tr><td colSpan={7} className="px-4 py-4 text-bone-500">{copy.labels.empty}</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </Reveal>

            <Reveal delay={190}>
              <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <DataTable title={copy.tabs.pendingOrders} rows={pendingOrders} empty={copy.labels.empty} columns={[
                  [copy.labels.signal, (row) => row.signalDate || '—'],
                  [copy.labels.exec, (row) => row.execDate || '—'],
                  [copy.labels.code, (row) => row.tsCode, 'text-lamp-300'],
                  [copy.labels.name, (row) => row.name || '—'],
                  [copy.labels.side, (row) => row.side],
                  [copy.labels.target, (row) => formatPct(row.targetWeight)],
                  [copy.labels.status, (row) => row.status],
                ]} />
                <DataTable title={copy.tabs.orders} rows={orders.slice().reverse().slice(0, 12)} empty={copy.labels.empty} columns={[
                  [copy.labels.signal, (row) => row.signalDate || '—'],
                  [copy.labels.exec, (row) => row.execDate || '—'],
                  [copy.labels.code, (row) => row.tsCode, 'text-lamp-300'],
                  [copy.labels.name, (row) => row.name || '—'],
                  [copy.labels.side, (row) => row.side],
                  [copy.labels.desired, (row) => row.desiredShares],
                  [copy.labels.ordered, (row) => row.orderShares],
                  [copy.labels.notional, (row) => formatCurrency(row.estimatedNotional, currency)],
                  [copy.labels.priceSource, (row) => row.priceSource || '—'],
                  [copy.labels.status, (row) => row.status],
                  [copy.labels.reason, (row) => row.reason],
                ]} />
              </section>
            </Reveal>

            <Reveal delay={200}>
              <section className="mt-6 grid gap-6 lg:grid-cols-2">
                <DataTable title={copy.tabs.targets} rows={positiveTargets} empty={copy.labels.empty} columns={[
                  [copy.labels.code, (row) => row.tsCode, 'text-lamp-300'],
                  [copy.labels.name, (row) => row.name || '—'],
                  [copy.labels.asset, (row) => row.assetType],
                  [copy.labels.target, (row) => formatPct(row.targetWeight)],
                  ['Signal', (row) => row.signalDate],
                ]} />
                <DataTable title={copy.tabs.trades} rows={(bundle.trades || []).slice().reverse().slice(0, 12)} empty={copy.labels.empty} columns={[
                  ['Date', (row) => row.date],
                  [copy.labels.code, (row) => row.tsCode, 'text-lamp-300'],
                  [copy.labels.name, (row) => row.name || '—'],
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
                <td key={label} className={`px-4 py-3 ${className}`}>{getValue(row)}</td>
              ))}
            </tr>
          )) : <tr><td colSpan={columns.length} className="px-4 py-4 text-bone-500">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

export default StrategyMonitorApp;
