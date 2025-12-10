import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Terminal, TrendingUp, BookOpen, Briefcase, 
  Mail, Globe, Database, Cpu, 
  ChevronRight, Download, ExternalLink, Layers, Activity, 
  Zap, Languages
} from 'lucide-react';

// External data sources pulled from the public folder (mirrors the old site structure)
const PORTFOLIO_DATA_URL = '/data/portfolio.csv';
const NET_VALUES_DATA_URL = '/data/net_values.csv';
const RESUME_ASSET_URL = '/assets/resume.pdf';

// Updated Palette: More Neon/Terminal like
const COLORS = ['#22d3ee', '#3b82f6', '#a855f7', '#71717a'];

const splitCsvLines = (text) => text.trim().split(/\r?\n/).filter(Boolean);

const headerMatches = (header, variants) =>
  variants.some(
    (candidate) =>
      header === candidate || header.toLowerCase() === candidate.toLowerCase()
  );

const parsePortfolioCsv = (text) => {
  const lines = splitCsvLines(text);
  if (!lines.length) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const idx = {
    ticker: headers.findIndex((h) => headerMatches(h, ['ticker', '代码'])),
    name: headers.findIndex((h) => headerMatches(h, ['stock_name', '股票名称'])),
    weight: headers.findIndex((h) => headerMatches(h, ['weight', '权重'])),
    reason: headers.findIndex((h) => headerMatches(h, ['reason', '投资理由'])),
  };

  return lines
    .slice(1)
    .map((line) => {
      const cells = line.split(',').map((cell) => cell.trim());
      return {
        ticker: idx.ticker >= 0 ? cells[idx.ticker] : '',
        name: idx.name >= 0 ? cells[idx.name] : '',
        weight: idx.weight >= 0 ? Number(cells[idx.weight]) : 0,
        reason: idx.reason >= 0 ? cells[idx.reason] : '',
      };
    })
    .filter((row) => row.ticker);
};

const parseNetValuesCsv = (text) => {
  const lines = splitCsvLines(text);
  if (lines.length <= 1) return [];

  return lines
    .slice(1)
    .map((line) => {
      const [date, value, pctChange] = line.split(',').map((entry) => entry.trim());
      return {
        date,
        value: Number(value),
        pctChange: Number(pctChange),
      };
    })
    .filter((row) => row.date && !Number.isNaN(row.value));
};

const filterNetValuesByRange = (data, range) => {
  if (!data.length) return [];

  const latestDate = new Date(data[data.length - 1].date);
  const monthsBack = {
    '3M': 3,
    '6M': 6,
    '1Y': 12,
  }[range] || 12;

  const threshold = new Date(latestDate);
  threshold.setMonth(threshold.getMonth() - monthsBack);

  return data.filter((entry) => new Date(entry.date) >= threshold);
};

const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'EN', name: 'English', description: 'Operate the site in English copy.' },
  { id: 'zh', label: '中', name: '中文', description: '切换到中文界面，查看本地化内容。' },
];

const uiText = {
  en: {
    brandTagline: 'Quant Research Terminal',
    feedLive: 'FEED: LIVE',
    menu: {
      home: 'Console',
      resume: 'Resume',
      portfolio: 'Portfolio',
      netvalues: 'Live Alpha',
    },
    languagePanelTitle: 'Language Center',
    languagePanelDesc: 'Switch between English and Chinese copy instantly.',
  },
  zh: {
    brandTagline: '量化研究终端',
    feedLive: '数据流：实时',
    menu: {
      home: '控制台',
      resume: '简历',
      portfolio: '组合',
      netvalues: '净值/Alpha',
    },
    languagePanelTitle: '语言切换',
    languagePanelDesc: '一键在英文与中文内容间切换。',
  },
};

const homeContent = {
  en: {
    pill: 'OPEN FOR OPPORTUNITIES',
    heroDescription: 'Decoding market inefficiencies with Mathematics, Machine Learning, and Finance Logic.',
    contact: 'CONTACT ME',
    linkedin: 'My Linkedin',
    techTitle: 'Tech Arsenal',
    techStacks: [
      { title: 'QUANT CORE', skills: ['Stochastic Calculus', 'Time Series Analysis', 'Portfolio Optimization', 'Risk Modeling'], icon: Cpu },
      { title: 'AI & ML', skills: ['NLP', 'GANs', 'Reinforcement Learning', 'Sentiment Analysis'], icon: Terminal },
      { title: 'ENGINEERING', skills: ['Python', 'C++', 'Java'], icon: Database },
    ],
    aboutTitle: 'About Me',
    aboutParagraphs: [
      'I am a dual-degree candidate in Data Science & Finance at HEC Paris & École Polytechnique, blending the precision of engineering with financial intuition. My academic foundation was built at Fudan University (Economics & Finance).',
      'My passion lies in the intersection of unstructured data and alpha generation. From scraping millions of tweets to training GANs for asset pricing, I enjoy the challenge of turning noise into signal.',
    ],
  },
  zh: {
    pill: '寻找下一段机遇',
    heroDescription: '用数学、机器学习与金融直觉拆解市场低效。',
    contact: '联系我',
    linkedin: '我的 LinkedIn',
    techTitle: '技能矩阵',
    techStacks: [
      { title: '量化核心', skills: ['随机微积分', '时间序列分析', '投资组合优化', '风险建模'], icon: Cpu },
      { title: 'AI 与机器学习', skills: ['自然语言处理 (NLP)', '生成对抗网络 (GANs)', '强化学习', '情绪分析'], icon: Terminal },
      { title: '工程', skills: ['Python', 'C++', 'Java'], icon: Database },
    ],
    aboutTitle: '关于我',
    aboutParagraphs: [
      '我正在 HEC Paris 与巴黎综合理工学院攻读数据科学和金融双学位，将工程的严谨与金融直觉结合。此前在复旦大学经济学院（金融方向）打下金融学基础。',
      '我关注非结构化数据与 Alpha 挖掘的交叉点，从抓取海量推文到用 GAN 做资产定价，都乐于把噪音转化成可交易的信号。',
    ],
  },
};

const resumeContent = {
  en: {
    title: 'Resume',
    subtitle: 'Data & Finance dual-degree candidate with hands-on experience building GAN-based SDF models, LSTM macro factor extraction, and theme-driven alpha signals. Skilled in NLP, alternative data, and high-frequency options analytics. Seeking a Quantitative Research internship in France from March 23 to August 31, 2026.',
    openPdf: 'Open PDF',
    educationTitle: 'Education',
    experienceTitle: 'Internship Experience',
    projectTitle: 'Project Experience',
    skillsTitle: 'Skills & Other',
    education: [
      {
        school: 'HEC Paris & École Polytechnique',
        location: 'Paris, France',
        period: 'September 2025 - June 2027',
        title: "Dual Master's Degree in Data Science & Finance",
        note: 'Core courses: Machine Learning, Deep Learning and Optimization, Algorithmic Trading, Stochastic Calculus, Asset Pricing.',
      },
      {
        school: 'Fudan University, School of Economics',
        location: 'Shanghai, China',
        period: 'September 2021 - June 2025',
        title: 'Bachelor of Economics, Finance',
        note: 'Core courses: Machine Learning, Stochastic Processes, Financial Engineering & Derivatives Pricing, Algorithms.',
      },
    ],
    experiences: [
      {
        company: 'Pinnace Asset Management',
        location: 'Shanghai, China',
        title: 'Quantitative Researcher Intern, Alpha Team',
        period: 'November 2023 - July 2024; January 2025 - March 2025',
        bullets: [
          'Designed a nonlinear asset pricing architecture grounded in no-arbitrage principles, engineering an adversarial learning framework to estimate a flexible SDF from high-dimensional firm characteristics. Developed custom GAN-based components to identify stress points in pricing conditions, enabling the model to capture intricate interaction structures that linear asset pricing frameworks cannot represent.',
          'Developed multi-layered alpha signals by structuring alternative data—including investor text sentiment, retail-attention proxies, comment-volume dynamics, and option-implied positioning metrics such as gamma-exposure—into tradable features. Integrated these heterogeneous signals into a coherent decision engine that supports short-horizon trading and thematic screening.',
          'Engineered predictive factors from complex economic and micro-structural datasets by modeling nonlinear dependencies with recurrent architectures. Extracted latent macroeconomic states using customized LSTM modules and constructed structural industry indicators—such as bubble-intensity proxies derived from supply-chain networks and momentum cascades—to enhance systematic risk decomposition.',
        ],
      },
      {
        company: 'QianXiang Asset Management',
        location: 'Shanghai, China',
        title: 'Quantitative Researcher Intern, Equity Trading Team',
        period: 'August 2024 – October 2024',
        bullets: [
          'Designed a theme-extraction engine by engineering custom word-embedding and clustering algorithms to structure financial news into latent topic spaces. Built a real-time theme-heat monitoring system that quantified attention dynamics to support alpha discovery.',
          'Constructed an event-driven thematic investment model by systematically encoding policy shifts, macro releases, and earnings signals into structured event vectors. Developed a dynamic, correlation-aware theme-rotation framework using event taxonomy, cross-theme dependency, and importance weighting.',
          'Built a fully automated data pipeline using advanced web-scraping and traffic-capture techniques to collect policy texts, event streams, and market narratives. Structured unrefined text into analytics-ready datasets that served as the foundation for NLP factor research and event-based strategy modeling.',
        ],
      },
    ],
    projects: [
      {
        title: 'Fund Manager Partisan Speech Recognize Program',
        role: "Research Assistant • Professor Lin Sun, Fudan University's FISF",
        location: 'Shanghai, China',
        period: 'September 2023 – August 2024',
        bullets: [
          'Engineered a large-scale text analytics pipeline to harvest and structure a decade of public communications from U.S. lawmakers and institutional fund managers. Built classification and sentiment-inference modules that uncovered ideological and behavioral patterns through linguistic embeddings and signal-processing of speech content.',
          'Designed and fine-tuned a high-capacity vision-based sentiment model, extending deep convolutional architectures to interpret emotional signals embedded in images paired with financial commentary. Integrated multimodal outputs with text-based sentiment systems to construct enriched behavioral features for downstream quantitative analysis.',
        ],
      },
    ],
    skills: [
      { label: 'Languages', value: 'English (IELTS 7.5, GRE 323), Mandarin (Native), French (Beginner)' },
      { label: 'Computer', value: 'Python, C++, Java' },
      { label: 'Certifications', value: 'C++ Programming for Financial Engineering (with Distinction), Baruch College' },
    ],
  },
  zh: {
    title: '简历',
    subtitle: '数据与金融双学位，实操 GAN-SDF 模型、LSTM 宏观因子提取与主题 Alpha 信号，熟悉 NLP、另类数据与高频期权分析。寻求 2026/3/23 - 8/31 在法国的量化研究实习机会。',
    openPdf: '打开 PDF',
    educationTitle: '教育经历',
    experienceTitle: '实习经历',
    projectTitle: '项目经历',
    skillsTitle: '技能与其他',
    education: [
      {
        school: 'HEC Paris 与巴黎综合理工学院',
        location: '巴黎，法国',
        period: '2025 年 9 月 - 2027 年 6 月',
        title: '数据科学与金融双硕士',
        note: '核心课程：机器学习、深度学习与优化、算法交易、随机微积分、资产定价。',
      },
      {
        school: '复旦大学 经济学院',
        location: '上海，中国',
        period: '2021 年 9 月 - 2025 年 6 月',
        title: '经济学学士，金融',
        note: '核心课程：机器学习、随机过程、金融工程与衍生品定价、算法。',
      },
    ],
    experiences: [
      {
        company: 'Pinnace Asset Management',
        location: '上海，中国',
        title: '量化研究员实习生，Alpha 组',
        period: '2023 年 11 月 - 2024 年 7 月；2025 年 1 月 - 2025 年 3 月',
        bullets: [
          '设计带无套利约束的非线性资产定价框架，搭建对抗学习体系估计可灵活拟合高维特征的 SDF，并用自定义 GAN 组件识别定价约束中的压力点，捕捉线性模型无法表示的复杂交互。',
          '将另类数据（投资者文本情绪、散户关注度、评论量变化、期权 Gamma 暴露等）结构化为可交易特征，构建多层 Alpha 信号并整合为支持短周期交易与主题筛选的决策引擎。',
          '利用循环网络建模经济与微观结构数据的非线性依赖，提取自定义 LSTM 宏观状态因子，结合供应链网络与动量构造行业泡沫强度等结构性指标，强化系统性风险分解。',
        ],
      },
      {
        company: '乾象资产',
        location: '上海，中国',
        title: '量化研究员实习生，股票交易组',
        period: '2024 年 8 月 - 2024 年 10 月',
        bullets: [
          '设计定制词向量与聚类算法，构建财经新闻的主题嵌入与实时热度监控，支撑 Alpha 挖掘。',
          '将政策、宏观数据、业绩信号编码为结构化事件向量，基于事件分类、主题依赖与重要度构建相关性敏感的动态题材轮动框架。',
          '用高级抓包与自动化爬虫采集政策文本、事件流与市场叙事，清洗为可用于 NLP 因子研究与事件驱动策略建模的分析级数据集。',
        ],
      },
    ],
    projects: [
      {
        title: '基金经理政治倾向识别',
        role: '研究助理 • 孙霖教授，复旦大学泛海国际金融学院',
        location: '上海，中国',
        period: '2023 年 9 月 - 2024 年 8 月',
        bullets: [
          '搭建大规模文本分析流水线，抓取并结构化美国议员与机构基金经理十年公开发言；构建分类与情感推断模块，通过语言嵌入与信号处理揭示意识形态与行为模式。',
          '设计并微调高容量视觉情绪模型，扩展卷积网络以解读金融评论配图的情绪信号；将多模态输出与文本情绪系统融合，构建下游量化分析的行为特征。',
        ],
      },
    ],
    skills: [
      { label: '语言', value: '英语（IELTS 7.5，GRE 323），中文（母语），法语（初级）' },
      { label: '计算机', value: 'Python, C++, Java' },
      { label: '证书', value: 'C++ 金融工程（优等），巴鲁克学院' },
    ],
  },
};

const portfolioCopy = {
  en: {
    title: 'Portfolio & Holdings',
    subtitle: 'Synced with portfolio.csv from the old site (no hard-coded rows).',
    openCsv: 'Open CSV',
    loadingError: 'Unable to load portfolio data.',
    empty: 'No holdings found in the CSV.',
    awaiting: 'Awaiting data from portfolio.csv',
    cardWeight: 'Weight',
    cardSource: 'From portfolio.csv',
    noReason: 'No rationale provided in CSV.',
    imported: 'Imported holding',
    selectLabel: '> SELECT ticker, stock_name, weight, reason FROM portfolio.csv',
    totalWeight: 'Total weight',
  },
  zh: {
    title: '持仓与组合',
    subtitle: '与旧站的 portfolio.csv 同步（无硬编码行）。',
    openCsv: '打开 CSV',
    loadingError: '无法加载组合数据。',
    empty: 'CSV 中没有持仓记录。',
    awaiting: '等待 portfolio.csv 数据',
    cardWeight: '权重',
    cardSource: '来自 portfolio.csv',
    noReason: 'CSV 未提供理由。',
    imported: '导入持仓',
    selectLabel: '> 从 portfolio.csv 读取 ticker, stock_name, weight, reason',
    totalWeight: '总权重',
  },
};

const netValuesCopy = {
  en: {
    title: 'Live Alpha Monitor',
    feedBadge: 'CSV FEED',
    source: 'Source: data/net_values.csv & portfolio.csv',
    latestLabel: 'LATEST NET VALUE',
    performanceTag: 'PERFORMANCE TRACKING',
    chartTitle: 'Strategy Net Values',
    chartBadge: 'Backtested CSV',
    loading: 'Loading net values from CSV...',
    error: 'Unable to load net values from CSV.',
    empty: 'No data available in net_values.csv',
    allocation: 'Allocation',
    noWeights: 'No weights found.',
    waiting: 'Waiting for CSV',
    tooltipLabel: 'Net Value',
    portfolioLoading: 'Loading portfolio.csv...',
    portfolioError: 'Unable to load portfolio holdings.',
  },
  zh: {
    title: '净值/Alpha 实时面板',
    feedBadge: 'CSV 数据流',
    source: '数据源：data/net_values.csv 与 portfolio.csv',
    latestLabel: '最新净值',
    performanceTag: '绩效跟踪',
    chartTitle: '策略净值',
    chartBadge: '回测 CSV',
    loading: '正在从 CSV 加载净值...',
    error: '无法从 CSV 加载净值。',
    empty: 'net_values.csv 中暂无数据',
    allocation: '组合权重',
    noWeights: '没有权重数据。',
    waiting: '等待 CSV',
    tooltipLabel: '净值',
    portfolioLoading: '正在加载 portfolio.csv...',
    portfolioError: '无法加载组合持仓。',
  },
};

const tableHeaders = {
  en: { ticker: 'TICKER', asset: 'ASSET', weight: 'WEIGHT', reason: 'REASON', totalPrefix: 'Total weight' },
  zh: { ticker: '代码', asset: '资产', weight: '权重', reason: '理由', totalPrefix: '总权重' },
};

const chartRangeLabels = {
  en: [
    { key: '3M', label: '3M' },
    { key: '6M', label: '6M' },
    { key: '1Y', label: '1Y' },
  ],
  zh: [
    { key: '3M', label: '近3月' },
    { key: '6M', label: '近6月' },
    { key: '1Y', label: '近1年' },
  ],
};

// --- BACKGROUND COMPONENT ---
const InteractiveBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      {/* Base Grid - Faint */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Spotlight Effect */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.08), transparent 40%)`
        }}
      />

      {/* Secondary Spotlight for Grid Highlight */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`,
          WebkitMaskImage: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent)`
        }}
      />
    </div>
  );
};

// --- COMPONENTS ---

const LanguageSwitcher = ({ language, setLanguage }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const copy = uiText[language] || uiText.en;
  const activeOption = LANGUAGE_OPTIONS.find((opt) => opt.id === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={panelRef} className="fixed right-4 top-4 z-50">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center space-x-2 px-4 py-2 bg-black/80 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:text-cyan-300 hover:border-cyan-700/60 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
      >
        <Languages size={16} className="text-cyan-400" />
        <span className="font-mono">{language === 'zh' ? '中文 / EN' : 'EN / 中文'}</span>
        <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/60">
          {activeOption.label}
        </span>
      </button>

      {open && (
        <div className="mt-3 w-72 bg-black/90 border border-zinc-800 rounded-xl p-4 backdrop-blur-md shadow-[0_15px_50px_rgba(0,0,0,0.55)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase text-zinc-500 font-mono tracking-[0.2em]">{copy.languagePanelTitle}</p>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{copy.languagePanelDesc}</p>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#22c55e]"></span>
              <span className="font-mono">LIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {LANGUAGE_OPTIONS.map((opt) => {
              const active = language === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setLanguage(opt.id);
                    setOpen(false);
                  }}
                  className={`
                    text-left p-3 rounded-lg border transition-all duration-200 group
                    ${active ? 'border-cyan-600/80 bg-cyan-900/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.25)]' : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600'}
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[11px] rounded-full border ${active ? 'border-cyan-500 text-cyan-200' : 'border-zinc-700 text-zinc-400'}`}>
                      {opt.label}
                    </span>
                    <span className="text-sm font-semibold">{opt.name}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-2 leading-snug">{opt.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab, isMobile, language }) => {
  const copy = uiText[language] || uiText.en;
  const menuItems = [
    { id: 'home', icon: Terminal, label: copy.menu.home },
    { id: 'resume', icon: Briefcase, label: copy.menu.resume },
    { id: 'portfolio', icon: Layers, label: copy.menu.portfolio },
    { id: 'netvalues', icon: Activity, label: copy.menu.netvalues },
  ];

  return (
    <div className={`
      ${isMobile ? 'w-full h-16 fixed bottom-0 flex-row justify-around z-50 border-t border-zinc-800' : 'w-64 h-screen flex-col border-r border-zinc-800'}
      bg-black/90 backdrop-blur-md flex p-4 transition-all duration-300 z-50
    `}>
      {!isMobile && (
        <div className="mb-12 mt-6 px-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="text-cyan-400" size={24} fill="currentColor" />
            <h1 className="text-2xl font-bold text-white tracking-tighter">YW<span className="text-zinc-600">.Q</span></h1>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{copy.brandTagline}</p>
        </div>
      )}
      
      <nav className={`flex ${isMobile ? 'w-full justify-around items-center' : 'flex-col space-y-2'}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-md transition-all duration-200 group relative overflow-hidden
              ${activeTab === item.id 
                ? 'text-cyan-400 bg-zinc-900 border border-zinc-800' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}
            `}
          >
            {activeTab === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
            )}
            <item.icon size={20} className={activeTab === item.id ? "drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" : ""} />
            {!isMobile && <span className="font-mono text-sm font-medium tracking-tight">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!isMobile && (
        <div className="mt-auto px-4 py-6 border-t border-zinc-900">
          <div className="flex items-center space-x-3 text-xs text-zinc-500 font-mono">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span>{copy.feedLive}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const HomePage = ({ language }) => {
  const copy = homeContent[language] || homeContent.en;
  const aboutParagraphs = language === 'zh'
    ? [
        <>我正在 <strong className="text-white">HEC Paris</strong> 与 <strong className="text-white">巴黎综合理工学院</strong>攻读数据科学和金融双学位，将工程的严谨与金融直觉结合。此前在 <strong className="text-white">复旦大学</strong>经济学院（金融方向）打下金融学基础。</>,
        <>我关注非结构化数据与 <strong className="text-white">Alpha</strong> 挖掘的交叉点，从抓取海量推文到用 GAN 做资产定价，都乐于把噪音转化成可交易的信号。</>,
      ]
    : [
        <>I am a dual-degree candidate in Data Science & Finance at <strong className="text-white">HEC Paris & École Polytechnique</strong>, blending the precision of engineering with financial intuition. My academic foundation was built at <strong className="text-white">Fudan University</strong> (Economics & Finance).</>,
        <>My passion lies in the intersection of <strong className="text-white">unstructured data</strong> and <strong className="text-white">alpha generation</strong>. From scraping millions of tweets to training GANs for asset pricing, I enjoy the challenge of turning noise into signal.</>,
      ];

  const heroDescription = language === 'zh'
    ? <>用 <span className="text-white font-medium">数学</span>、<span className="text-white font-medium">机器学习</span> 与 <span className="text-white font-medium">金融直觉</span> 拆解市场低效。</>
    : <>Decoding market inefficiencies with <span className="text-white font-medium">Mathematics</span>, <span className="text-white font-medium">Machine Learning</span>, and <span className="text-white font-medium">Finance Logic</span>.</>;

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm mb-6">
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>
            <span className="text-xs text-zinc-400 font-mono">{copy.pill}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6 leading-[0.9]">
            YUHAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-700">WU</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed font-light">
            {heroDescription}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-10">
            <a href="mailto:contact.yuhan@gmail.com" className="group flex items-center space-x-2 px-6 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors">
              <Mail size={18} /> <span>{copy.contact}</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </a>
            <a href="https://www.linkedin.com/in/yuhan-wu-645b74295/" target="_blank" rel="noreferrer" className="flex items-center space-x-2 px-6 py-3 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-300 rounded transition-all hover:border-zinc-600">
              <Globe size={18} /> <span>{copy.linkedin}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Tech Stack - Grid Style */}
      <section>
        <div className="flex items-center mb-8 space-x-4">
          <div className="h-[1px] bg-zinc-800 flex-1"></div>
          <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">{copy.techTitle}</h2>
          <div className="h-[1px] bg-zinc-800 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
          {copy.techStacks.map((stack, idx) => (
            <div key={idx} className="p-8 bg-black hover:bg-zinc-900/80 transition-colors group relative">
              <div className="absolute top-4 right-4 text-zinc-800 group-hover:text-cyan-900 transition-colors">
                 <stack.icon size={48} strokeWidth={1} />
              </div>
              <h3 className="font-bold font-mono text-zinc-200 mb-4 tracking-tight">{stack.title}</h3>
              <ul className="space-y-3">
                {stack.skills.map((skill, sIdx) => (
                  <li key={sIdx} className="text-sm text-zinc-500 flex items-center group-hover:text-zinc-400 transition-colors">
                    <div className="w-1 h-1 bg-cyan-500 mr-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* About Summary */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-zinc-900 pt-12">
        <div className="md:col-span-4">
          <h2 className="text-2xl font-bold text-white">{copy.aboutTitle}</h2>
          <div className="h-1 w-12 bg-cyan-500 mt-2"></div>
        </div>
        <div className="md:col-span-8 text-zinc-400 leading-relaxed space-y-4 font-light">
          {aboutParagraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>
    </div>
  );
};

const ResumePage = ({ language }) => {
  const copy = resumeContent[language] || resumeContent.en;
  const { education, experiences, projects, skills } = copy;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white tracking-tight">{copy.title}</h2>
          <p className="text-zinc-300 font-mono text-sm">Yuhan Wu • contact.yuhan@gmail.com • +33 749845277 • https://www.yuhanwu.cn</p>
          <p className="text-zinc-500 text-sm leading-relaxed">
            {copy.subtitle}
          </p>
        </div>
        <a
          href={RESUME_ASSET_URL}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center space-x-2 text-white bg-zinc-800 hover:bg-cyan-600 px-4 py-2 rounded text-sm font-medium transition-all"
        >
          <Download size={16} /> <span>{copy.openPdf}</span>
        </a>
      </div>

      {/* Education */}
      <section>
        <div className="flex items-center mb-6">
          <BookOpen className="text-cyan-500 mr-3" size={20}/> 
          <h3 className="text-xl font-bold text-white">{copy.educationTitle}</h3>
        </div>
        
        <div className="relative border-l border-zinc-800 ml-3 space-y-8 pb-4">
          {education.map((edu, idx) => (
            <div key={`${edu.school}-${idx}`} className="ml-8 relative group">
              <div className="absolute -left-[37px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-cyan-500 group-hover:scale-125 transition-transform shadow-[0_0_8px_#06b6d4]"></div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-lg font-semibold text-white">{edu.school}</h4>
                  <span className="text-xs text-zinc-500 font-mono">{edu.period}</span>
                </div>
                <p className="text-sm text-zinc-400 mb-1">{edu.title}</p>
                <p className="text-xs text-zinc-500 font-mono">{edu.location}</p>
                {edu.note && <p className="text-xs text-zinc-500 mt-2">{edu.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section>
        <div className="flex items-center mb-6">
          <Briefcase className="text-cyan-500 mr-3" size={20}/> 
          <h3 className="text-xl font-bold text-white">{copy.experienceTitle}</h3>
        </div>

        <div className="space-y-6">
          {experiences.map((role, idx) => (
            <div key={`${role.company}-${idx}`} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-cyan-700/60 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-lg font-semibold text-white">{role.title}</h4>
                <span className="text-xs text-zinc-500 font-mono">{role.period}</span>
              </div>
              <p className="text-sm text-zinc-400 mb-1">{role.company} • {role.location}</p>
              <ul className="text-sm text-zinc-400 list-disc list-inside mt-3 space-y-1">
                {role.bullets.map((line, bulletIdx) => (
                  <li key={bulletIdx}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="flex items-center mb-6">
          <Layers className="text-cyan-500 mr-3" size={20}/> 
          <h3 className="text-xl font-bold text-white">{copy.projectTitle}</h3>
        </div>
        <div className="space-y-6">
          {projects.map((proj, idx) => (
            <div key={`${proj.title}-${idx}`} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-cyan-700/60 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-lg font-semibold text-white">{proj.title}</h4>
                <span className="text-xs text-zinc-500 font-mono">{proj.period}</span>
              </div>
              <p className="text-sm text-zinc-400 mb-1">{proj.role} • {proj.location}</p>
              <ul className="text-sm text-zinc-400 list-disc list-inside mt-3 space-y-1">
                {proj.bullets.map((line, bulletIdx) => (
                  <li key={bulletIdx}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <div className="flex items-center mb-6">
          <Cpu className="text-cyan-500 mr-3" size={20}/> 
          <h3 className="text-xl font-bold text-white">{copy.skillsTitle}</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {skills.map((item) => (
            <div key={item.label} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs uppercase text-zinc-500 font-mono mb-2">{item.label}</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{item.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const PortfolioPage = ({ language }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const copy = portfolioCopy[language] || portfolioCopy.en;
  const headers = tableHeaders[language] || tableHeaders.en;

  useEffect(() => {
    let isMounted = true;
    const loadPortfolio = async () => {
      try {
        const response = await fetch(PORTFOLIO_DATA_URL);
        if (!response.ok) {
          throw new Error('Failed to load portfolio.csv');
        }
        const text = await response.text();
        const parsed = parsePortfolioCsv(text);
        if (isMounted) {
          setPortfolio(parsed);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadPortfolio();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalWeight = portfolio.reduce((sum, pos) => sum + (pos.weight || 0), 0);
  const noHoldings = !loading && !error && portfolio.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{copy.title}</h2>
          <p className="text-zinc-500 font-mono text-xs mt-2">{copy.subtitle}</p>
        </div>
        <a
          href={PORTFOLIO_DATA_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-cyan-300 hover:border-cyan-700/60 transition-colors"
        >
          <Database size={14} /> <span>{copy.openCsv}</span>
        </a>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-44 bg-zinc-900/40 border border-zinc-800 rounded-xl animate-pulse" />
        ))}

        {error && (
          <div className="md:col-span-2 bg-red-900/20 border border-red-700/60 text-red-200 rounded-xl p-4 text-sm">
            {copy.loadingError}
          </div>
        )}

        {noHoldings && (
          <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-sm text-zinc-400">
            {copy.empty}
          </div>
        )}

        {!loading && !error && portfolio.map((pos, idx) => (
          <article key={`${pos.ticker}-${idx}`} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-cyan-700/60 transition-colors relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  {pos.name || pos.ticker}
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/60">{pos.ticker}</span>
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">{copy.cardWeight} {pos.weight}% • {copy.cardSource}</p>
              </div>
              <TrendingUp className="text-cyan-500" size={20}/>
            </div>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              {pos.reason || copy.noReason}
            </p>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-2">
                <Layers size={14} className="text-zinc-400" /> <span>{copy.imported}</span>
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-cyan-300 font-mono">{pos.weight}%</span>
            </div>
          </article>
        ))}
      </section>

      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden font-mono text-sm">
        <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
          <span className="text-zinc-400 text-xs">{copy.selectLabel}</span>
          <ExternalLink size={12} className="text-zinc-600 cursor-pointer hover:text-cyan-400" />
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 text-xs border-b border-zinc-800">
              <th className="px-6 py-3 font-normal">{headers.ticker}</th>
              <th className="px-6 py-3 font-normal">{headers.asset}</th>
              <th className="px-6 py-3 font-normal text-right">{headers.weight}</th>
              <th className="px-6 py-3 font-normal">{headers.reason}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {portfolio.map((pos, idx) => (
              <tr key={`${pos.ticker}-${idx}`} className="hover:bg-zinc-900/40 transition-colors group">
                <td className="px-6 py-3 text-cyan-500 group-hover:text-cyan-300">{pos.ticker}</td>
                <td className="px-6 py-3 text-zinc-400">{pos.name}</td>
                <td className="px-6 py-3 text-zinc-500 text-right">{pos.weight}%</td>
                <td className="px-6 py-3 text-zinc-400 leading-relaxed">{pos.reason}</td>
              </tr>
            ))}
            {portfolio.length === 0 && (
              <tr>
                <td className="px-6 py-3 text-zinc-500" colSpan={4}>{copy.awaiting}</td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-zinc-900/40 text-xs text-zinc-500">
            <tr>
              <td className="px-6 py-3" colSpan={4}>{copy.totalWeight}: {totalWeight}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const NetValuesPage = ({ language }) => {
  const [chartRange, setChartRange] = useState('1Y');
  const [netValues, setNetValues] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loadingNetValues, setLoadingNetValues] = useState(true);
  const [netValueError, setNetValueError] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState(false);

  const copy = netValuesCopy[language] || netValuesCopy.en;
  const headers = tableHeaders[language] || tableHeaders.en;
  const ranges = chartRangeLabels[language] || chartRangeLabels.en;
  const portfolioLabel = (portfolioCopy[language] || portfolioCopy.en).selectLabel;

  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadNetValues = async () => {
      try {
        const response = await fetch(NET_VALUES_DATA_URL);
        if (!response.ok) {
          throw new Error('Failed to load net_values.csv');
        }
        const text = await response.text();
        const parsed = parseNetValuesCsv(text);
        if (isMounted) {
          setNetValues(parsed);
          setLoadingNetValues(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setNetValueError(true);
          setLoadingNetValues(false);
        }
      }
    };

    loadNetValues();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setChartData(filterNetValuesByRange(netValues, chartRange));
  }, [netValues, chartRange]);

  useEffect(() => {
    let isMounted = true;
    const loadPortfolio = async () => {
      try {
        const response = await fetch(PORTFOLIO_DATA_URL);
        if (!response.ok) {
          throw new Error('Failed to load portfolio.csv');
        }
        const text = await response.text();
        const parsed = parsePortfolioCsv(text);
        if (isMounted) {
          setPortfolio(parsed);
          setLoadingPortfolio(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setPortfolioError(true);
          setLoadingPortfolio(false);
        }
      }
    };

    loadPortfolio();
    return () => {
      isMounted = false;
    };
  }, []);

  const latestPoint = (chartData.length ? chartData[chartData.length - 1] : netValues[netValues.length - 1]) || null;
  const piePositions = portfolio.filter((pos) => pos.weight > 0);

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
      <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {copy.title}
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
              <Database size={12} /> {copy.feedBadge}
            </span>
          </h2>
          <p className="text-zinc-500 font-mono text-xs mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]"></span>
            {copy.source}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 font-mono mb-1">{copy.latestLabel}</p>
          <p className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]">
            {latestPoint?.value ? latestPoint.value.toFixed(4) : '--'}
          </p>
          <p className="text-[10px] text-zinc-600 font-mono mt-1">{latestPoint?.date || copy.waiting}</p>
        </div>
      </header>

      <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-zinc-500 font-mono mb-1">{copy.performanceTag}</p>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              {copy.chartTitle}
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-900/80 text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
                {copy.chartBadge}
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {ranges.map((range) => (
              <button
                key={range.key}
                onClick={() => setChartRange(range.key)}
                className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
                  chartRange === range.key
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/60'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-[260px]">
          {loadingNetValues && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm bg-black/40 rounded-lg">
              {copy.loading}
            </div>
          )}
          {netValueError && (
            <div className="absolute inset-0 flex items-center justify-center text-red-300 text-sm bg-black/40 rounded-lg">
              {copy.error}
            </div>
          )}
          {!loadingNetValues && !netValueError && !chartData.length && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm bg-black/40 rounded-lg">
              {copy.empty}
            </div>
          )}
          {!loadingNetValues && !netValueError && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a" 
                  tickLine={false} 
                  axisLine={{ stroke: '#27272a' }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  stroke="#71717a" 
                  tickLine={false} 
                  axisLine={{ stroke: '#27272a' }}
                  tick={{ fontSize: 11 }}
                  domain={['dataMin - 0.05', 'dataMax + 0.05']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#1f2937',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                    padding: '8px 10px'
                  }}
                  labelStyle={{ color: '#9ca3af', marginBottom: 4 }}
                  formatter={(value) => [Number(value).toFixed(4), copy.tooltipLabel]}
                />
                <Area 
                  type="step" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Stats/Pie */}
        <div className="space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
             <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest absolute top-4 left-4">{copy.allocation}</h3>
             <div className="w-full h-[200px] mt-4">
              {loadingPortfolio ? (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">{copy.portfolioLoading}</div>
              ) : portfolioError ? (
                <div className="flex items-center justify-center h-full text-red-300 text-sm">{copy.portfolioError}</div>
              ) : piePositions.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={piePositions}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="weight"
                      stroke="none"
                    >
                      {piePositions.map((entry, index) => (
                        <Cell key={`cell-${entry.ticker}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', borderRadius: '4px', fontSize: '12px'}} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">{copy.noWeights}</div>
              )}
             </div>
             <div className="w-full grid grid-cols-2 gap-2 mt-2">
               {piePositions.map((pos, idx) => (
                 <div key={`${pos.ticker}-${idx}`} className="flex items-center justify-between px-2 py-1 bg-zinc-900 rounded text-[10px] text-zinc-400">
                   <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full mr-2" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>{pos.ticker}</span>
                 <span className="font-mono">{pos.weight}%</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* Data Table - Terminal Style */}
      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden font-mono text-sm">
        <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
           <span className="text-zinc-400 text-xs">{portfolioLabel}</span>
           <ExternalLink size={12} className="text-zinc-600 cursor-pointer hover:text-cyan-400"/>
        </div>
        <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-xs border-b border-zinc-800">
                <th className="px-6 py-3 font-normal">{headers.ticker}</th>
                <th className="px-6 py-3 font-normal">{headers.asset}</th>
                <th className="px-6 py-3 font-normal text-right">{headers.weight}</th>
                <th className="px-6 py-3 font-normal">{headers.reason}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loadingPortfolio && (
                <tr>
                  <td className="px-6 py-3 text-zinc-500" colSpan={4}>{copy.portfolioLoading}</td>
                </tr>
              )}
              {portfolioError && (
                <tr>
                  <td className="px-6 py-3 text-red-300" colSpan={4}>{copy.portfolioError}</td>
                </tr>
              )}
              {!loadingPortfolio && !portfolioError && portfolio.map((pos, idx) => (
                <tr key={`${pos.ticker}-${idx}`} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-6 py-3 text-cyan-500 group-hover:text-cyan-300">{pos.ticker}</td>
                  <td className="px-6 py-3 text-zinc-400">{pos.name}</td>
                  <td className="px-6 py-3 text-zinc-500 text-right">{pos.weight}%</td>
                  <td className="px-6 py-3 text-zinc-400 leading-relaxed">{pos.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [language, setLanguage] = useState('en');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomePage language={language} />;
      case 'resume': return <ResumePage language={language} />;
      case 'portfolio': return <PortfolioPage language={language} />;
      case 'netvalues': return <NetValuesPage language={language} />;
      default: return <HomePage language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-cyan-900 selection:text-cyan-100 flex flex-col md:flex-row overflow-hidden relative">
      {/* Interactive Background Layer */}
      <InteractiveBackground />

      <LanguageSwitcher language={language} setLanguage={setLanguage} />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} language={language} />
      
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-black">
        <div className="p-6 md:p-12 pb-24 md:pb-12 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
