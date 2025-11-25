import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Terminal, TrendingUp, BookOpen, Briefcase, User, 
  Mail, Phone, Globe, Github, Code, Database, Cpu, 
  ChevronRight, Download, ExternalLink, Layers, Activity, 
  Zap
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

const Sidebar = ({ activeTab, setActiveTab, isMobile }) => {
  const menuItems = [
    { id: 'home', icon: Terminal, label: 'Console' },
    { id: 'resume', icon: Briefcase, label: 'Resume' },
    { id: 'portfolio', icon: Layers, label: 'Portfolio' },
    { id: 'netvalues', icon: Activity, label: 'Live Alpha' },
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
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Quant Research Terminal</p>
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
            <span>FEED: LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};

const HomePage = () => (
  <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
    {/* Hero Section */}
    <section className="relative">
      <div className="relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm mb-6">
          <span className="flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></span>
          <span className="text-xs text-zinc-400 font-mono">OPEN FOR OPPORTUNITIES</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-6 leading-[0.9]">
          YUHAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-700">WU</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed font-light">
          Decoding market inefficiencies with <span className="text-white font-medium">Mathematics</span>, <span className="text-white font-medium">Machine Learning</span>, and <span className="text-white font-medium">Finance Logic</span>.
        </p>
        
        <div className="flex flex-wrap gap-4 mt-10">
          <a href="mailto:15287836068wyh@gmail.com" className="group flex items-center space-x-2 px-6 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors">
            <Mail size={18} /> <span>CONTACT ME</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </a>
          <a href="https://www.linkedin.com/in/yuhan-wu-645b74295/" target="_blank" rel="noreferrer" className="flex items-center space-x-2 px-6 py-3 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-300 rounded transition-all hover:border-zinc-600">
            <Globe size={18} /> <span>My Linkedin</span>
          </a>
        </div>
      </div>
    </section>

    {/* Tech Stack - Grid Style */}
    <section>
      <div className="flex items-center mb-8 space-x-4">
        <div className="h-[1px] bg-zinc-800 flex-1"></div>
        <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Tech Arsenal</h2>
        <div className="h-[1px] bg-zinc-800 flex-1"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
        {[
          { title: "QUANT CORE", skills: ["Stochastic Calculus", "Time Series Analysis", "Portfolio Optimization", "Risk Modeling"], icon:  Cpu },
          { title: "AI & ML", skills: ["NLP", "GANs", "Reinforcement Learning", "Sentiment Analysis"], icon: Terminal },
          { title: "ENGINEERING", skills: ["Python", "C++", "Java"], icon: Database },
        ].map((stack, idx) => (
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
        <h2 className="text-2xl font-bold text-white">About Me</h2>
        <div className="h-1 w-12 bg-cyan-500 mt-2"></div>
      </div>
      <div className="md:col-span-8 text-zinc-400 leading-relaxed space-y-4 font-light">
        <p>
          I am a dual-degree candidate in Data Science & Finance at <strong className="text-white">HEC Paris & École Polytechnique</strong>, blending the precision of engineering with financial intuition. My academic foundation was built at <strong className="text-white">Fudan University</strong> (Economics & Finance).
        </p>
        <p>
          My passion lies in the intersection of <strong className="text-white">unstructured data</strong> and <strong className="text-white">alpha generation</strong>. From scraping millions of tweets to training GANs for asset pricing, I enjoy the challenge of turning noise into signal.
        </p>
      </div>
    </section>
  </div>
);

const ResumePage = () => {
  const education = [
    {
      school: 'HEC Paris & École Polytechnique',
      location: 'Paris, France',
      period: 'September 2025 - June 2027',
      title: "Dual Master's Degree in Data Science & Finance",
      note: 'Data & Finance dual-degree candidate; seeking Quant Research internship in France (Mar 23 - Aug 31, 2026).',
    },
    {
      school: 'Fudan University, School of Economics',
      location: 'Shanghai, China',
      period: 'September 2021 - June 2025',
      title: 'Bachelor of Economics, Finance (GPA: 91/100)',
      note: 'Graduated with strong quantitative finance foundation.',
    },
  ];

  const experiences = [
    {
      company: 'QianXiang Asset Management',
      location: 'Shanghai, China',
      title: 'Quantitative Researcher Intern, Equity Trading Team',
      period: 'July 2024 - November 2024',
      bullets: [
        'Built a hot-theme selection strategy using Hugging Face embeddings to cluster financial news; extracted themes with TF-IDF and monitored heat via Baidu Index.',
        'Developed a theme investment strategy around policy, macro data, and performance events; implemented dynamic theme-based portfolio rebalancing with correlation and importance scores.',
        'Automated scraping with Fiddler and Selenium for policy text and event data to supply the research pipeline.',
      ],
    },
    {
      company: 'Pinnacle Asset Management',
      location: 'Shanghai, China',
      title: 'Quantitative Researcher Intern, Alpha Team',
      period: 'November 2023 - July 2024',
      bullets: [
        'Engineered a GAN-based SDF model with a no-arbitrage objective to capture non-linear risk premia from high-dimensional characteristics, outperforming linear baselines.',
        'Built and backtested multiple alpha strategies: sentiment-driven signals from a proprietary LLM delivered 14% annualized return with >65% hit rate on high-beta names; options-based short-term signal from gamma exposure (GEX) and open interest.',
        'Modeled complex data with LSTM-derived macro state factors and an industry bubble intensity factor using supply chain graphs and momentum.',
      ],
    },
    {
      company: 'GuoTai Junan Security',
      location: 'Shanghai, China',
      title: 'Analyst Intern, Chemicals Industry Team',
      period: 'June 2023 - November 2023',
      bullets: [
        'Published a report on Huafeng Chemical and the spandex industry, covering production chain, financial operations, and peer comparisons during downturns.',
        'Built and maintained a visual database of chemical raw material inventory quantiles in Excel for daily use.',
      ],
    },
  ];

  const projects = [
    {
      title: 'Fund Manager Partisan Speech Recognition',
      role: 'Research Assistant • Prof. Lin Sun, Fudan University, FISF',
      location: 'Shanghai, China',
      period: 'September 2023 - June 2024',
      bullets: [
        'Scraped a decade of Twitter statements from fund managers and U.S. lawmakers (Python Requests) and performed sentiment analysis to classify political affiliation.',
        "Fine-tuned Google's Inception-v4 with PyTorch on ByteDance's image sentiment dataset; adapted output layers to capture emotional signals from images paired with tweets.",
      ],
    },
  ];

  const skills = [
    { label: 'Languages', value: 'English (IELTS 7.5, GRE 323), Mandarin (Native)' },
    { label: 'Computer', value: 'Python, C++, Java' },
    { label: 'Certifications', value: 'C++ Programming for Financial Engineering (with Distinction), Baruch College' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
      <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-white tracking-tight">Resume</h2>
          <p className="text-zinc-300 font-mono text-sm">Yuhan Wu • 15287836068wyh@gmail.com • +33 749845277 • yuhanwu.cn</p>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Data & Finance dual-degree candidate focused on GAN-based SDF modeling, LSTM macro factor extraction, and theme-driven alpha. Seeking a Quantitative Research internship in France (Mar 23 - Aug 31, 2026).
          </p>
        </div>
        <a
          href={RESUME_ASSET_URL}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center space-x-2 text-white bg-zinc-800 hover:bg-cyan-600 px-4 py-2 rounded text-sm font-medium transition-all"
        >
          <Download size={16} /> <span>Open PDF</span>
        </a>
      </div>

      {/* Education */}
      <section>
        <div className="flex items-center mb-6">
          <BookOpen className="text-cyan-500 mr-3" size={20}/> 
          <h3 className="text-xl font-bold text-white">Education</h3>
        </div>
        
        <div className="relative border-l border-zinc-800 ml-3 space-y-8 pb-4">
          {education.map((edu, idx) => (
            <div key={edu.school} className="ml-8 relative group">
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
          <h3 className="text-xl font-bold text-white">Internship Experience</h3>
        </div>

        <div className="space-y-6">
          {experiences.map((role) => (
            <div key={role.company} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-cyan-700/60 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-lg font-semibold text-white">{role.title}</h4>
                <span className="text-xs text-zinc-500 font-mono">{role.period}</span>
              </div>
              <p className="text-sm text-zinc-400 mb-1">{role.company} • {role.location}</p>
              <ul className="text-sm text-zinc-400 list-disc list-inside mt-3 space-y-1">
                {role.bullets.map((line, idx) => (
                  <li key={idx}>{line}</li>
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
          <h3 className="text-xl font-bold text-white">Project Experience</h3>
        </div>
        <div className="space-y-6">
          {projects.map((proj) => (
            <div key={proj.title} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 hover:border-cyan-700/60 transition-colors">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-lg font-semibold text-white">{proj.title}</h4>
                <span className="text-xs text-zinc-500 font-mono">{proj.period}</span>
              </div>
              <p className="text-sm text-zinc-400 mb-1">{proj.role} • {proj.location}</p>
              <ul className="text-sm text-zinc-400 list-disc list-inside mt-3 space-y-1">
                {proj.bullets.map((line, idx) => (
                  <li key={idx}>{line}</li>
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
          <h3 className="text-xl font-bold text-white">Skills & Other</h3>
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

const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setError('Unable to load portfolio data.');
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
          <h2 className="text-3xl font-bold text-white tracking-tight">Portfolio & Holdings</h2>
          <p className="text-zinc-500 font-mono text-xs mt-2">Synced with portfolio.csv from the old site (no hard-coded rows).</p>
        </div>
        <a
          href={PORTFOLIO_DATA_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400 hover:text-cyan-300 hover:border-cyan-700/60 transition-colors"
        >
          <Database size={14} /> <span>Open CSV</span>
        </a>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-44 bg-zinc-900/40 border border-zinc-800 rounded-xl animate-pulse" />
          ))}

        {error && (
          <div className="md:col-span-2 bg-red-900/20 border border-red-700/60 text-red-200 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {noHoldings && (
          <div className="md:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-sm text-zinc-400">
            No holdings found in the CSV.
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
                <p className="text-xs text-zinc-500 font-mono mt-1">Weight {pos.weight}% • From portfolio.csv</p>
              </div>
              <TrendingUp className="text-cyan-500" size={20}/>
            </div>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              {pos.reason || 'No rationale provided in CSV.'}
            </p>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-2">
                <Layers size={14} className="text-zinc-400" /> <span>Imported holding</span>
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-cyan-300 font-mono">{pos.weight}%</span>
            </div>
          </article>
        ))}
      </section>

      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden font-mono text-sm">
        <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
          <span className="text-zinc-400 text-xs">&gt; SELECT ticker, stock_name, weight, reason FROM portfolio.csv</span>
          <ExternalLink size={12} className="text-zinc-600 cursor-pointer hover:text-cyan-400" />
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-zinc-500 text-xs border-b border-zinc-800">
              <th className="px-6 py-3 font-normal">TICKER</th>
              <th className="px-6 py-3 font-normal">ASSET</th>
              <th className="px-6 py-3 font-normal text-right">WEIGHT</th>
              <th className="px-6 py-3 font-normal">REASON</th>
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
                <td className="px-6 py-3 text-zinc-500" colSpan={4}>Awaiting data from portfolio.csv</td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-zinc-900/40 text-xs text-zinc-500">
            <tr>
              <td className="px-6 py-3" colSpan={4}>Total weight: {totalWeight}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const NetValuesPage = () => {
  const [chartRange, setChartRange] = useState('1Y');
  const [netValues, setNetValues] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loadingNetValues, setLoadingNetValues] = useState(true);
  const [netValueError, setNetValueError] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [portfolioError, setPortfolioError] = useState(null);

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
          setNetValueError('Unable to load net values from CSV.');
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
          setPortfolioError('Unable to load portfolio holdings.');
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
            Live Alpha Monitor
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
              <Database size={12} /> CSV FEED
            </span>
          </h2>
          <p className="text-zinc-500 font-mono text-xs mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]"></span>
            Source: data/net_values.csv & portfolio.csv
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 font-mono mb-1">LATEST NET VALUE</p>
          <p className="text-3xl font-bold text-emerald-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]">
            {latestPoint?.value ? latestPoint.value.toFixed(4) : '--'}
          </p>
          <p className="text-[10px] text-zinc-600 font-mono mt-1">{latestPoint?.date || 'Waiting for CSV'}</p>
        </div>
      </header>

      <section className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
        <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-zinc-500 font-mono mb-1">PERFORMANCE TRACKING</p>
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              Strategy Net Values
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-zinc-900/80 text-zinc-300 border border-zinc-700/60 flex items-center gap-1">
                Backtested CSV
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {['3M', '6M', '1Y'].map((range) => (
              <button
                key={range}
                onClick={() => setChartRange(range)}
                className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
                  chartRange === range
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/60'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-[260px]">
          {loadingNetValues && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm bg-black/40 rounded-lg">
              Loading net values from CSV...
            </div>
          )}
          {netValueError && (
            <div className="absolute inset-0 flex items-center justify-center text-red-300 text-sm bg-black/40 rounded-lg">
              {netValueError}
            </div>
          )}
          {!loadingNetValues && !netValueError && !chartData.length && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm bg-black/40 rounded-lg">
              No data available in net_values.csv
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
                  formatter={(value) => [Number(value).toFixed(4), 'Net Value']}
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
             <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest absolute top-4 left-4">Allocation</h3>
             <div className="w-full h-[200px] mt-4">
              {loadingPortfolio ? (
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">Loading portfolio.csv...</div>
              ) : portfolioError ? (
                <div className="flex items-center justify-center h-full text-red-300 text-sm">{portfolioError}</div>
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
                <div className="flex items-center justify-center h-full text-zinc-500 text-sm">No weights found.</div>
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
           <span className="text-zinc-400 text-xs">&gt; SELECT ticker, stock_name, weight, reason FROM portfolio.csv</span>
           <ExternalLink size={12} className="text-zinc-600 cursor-pointer hover:text-cyan-400"/>
        </div>
        <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-xs border-b border-zinc-800">
                <th className="px-6 py-3 font-normal">TICKER</th>
                <th className="px-6 py-3 font-normal">ASSET</th>
                <th className="px-6 py-3 font-normal text-right">WEIGHT</th>
                <th className="px-6 py-3 font-normal">REASON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loadingPortfolio && (
                <tr>
                  <td className="px-6 py-3 text-zinc-500" colSpan={4}>Loading portfolio.csv...</td>
                </tr>
              )}
              {portfolioError && (
                <tr>
                  <td className="px-6 py-3 text-red-300" colSpan={4}>{portfolioError}</td>
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'resume': return <ResumePage />;
      case 'portfolio': return <PortfolioPage />;
      case 'netvalues': return <NetValuesPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-cyan-900 selection:text-cyan-100 flex flex-col md:flex-row overflow-hidden relative">
      {/* Interactive Background Layer */}
      <InteractiveBackground />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} />
      
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-black">
        <div className="p-6 md:p-12 pb-24 md:pb-12 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
