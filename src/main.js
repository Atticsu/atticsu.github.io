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

// --- MOCK DATA ---
const MOCK_PNL_DATA = [
  { date: '2024-01', value: 1.00 },
  { date: '2024-02', value: 1.02 },
  { date: '2024-03', value: 0.98 },
  { date: '2024-04', value: 1.05 },
  { date: '2024-05', value: 1.08 },
  { date: '2024-06', value: 1.12 },
  { date: '2024-07', value: 1.10 },
  { date: '2024-08', value: 1.15 },
  { date: '2024-09', value: 1.18 },
  { date: '2024-10', value: 1.22 },
  { date: '2024-11', value: 1.25 },
];

const MOCK_POSITIONS = [
  { ticker: 'NVDA', name: 'NVIDIA Corp', weight: 35, pnl: '+45.2%' },
  { ticker: 'MSFT', name: 'Microsoft', weight: 25, pnl: '+12.8%' },
  { ticker: 'BTC', name: 'Bitcoin ETF', weight: 15, pnl: '+8.5%' },
  { ticker: 'CASH', name: 'USD Liquidity', weight: 25, pnl: '0.0%' },
];

// Updated Palette: More Neon/Terminal like
const COLORS = ['#22d3ee', '#3b82f6', '#a855f7', '#71717a'];

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
          <a href="mailto:contact.yuhan@gmail.com" className="group flex items-center space-x-2 px-6 py-3 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors">
            <Mail size={18} /> <span>CONTACT ME</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </a>
          <a href="https://www.yuhanwu.cn/" target="_blank" rel="noreferrer" className="flex items-center space-x-2 px-6 py-3 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-300 rounded transition-all hover:border-zinc-600">
            <Globe size={18} /> <span>yuhanwu.cn</span>
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
          { title: "AI & ML", skills: ["Transformers (NLP)", "GANs / GenAI", "Reinforcement Learning", "Sentiment Analysis"], icon: Terminal },
          { title: "ENGINEERING", skills: ["Python (Pandas/NumPy)", "C++ (Low Latency)", "SQL / NoSQL", "Distributed Systems"], icon: Database },
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

const ResumePage = () => (
  <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
    <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
      <div>
        <h2 className="text-4xl font-bold text-white tracking-tight">Resume</h2>
        <p className="text-zinc-500 font-mono text-sm mt-2">HEC Paris • École Polytechnique • Fudan</p>
      </div>
      <button className="group flex items-center space-x-2 text-white bg-zinc-800 hover:bg-cyan-600 px-4 py-2 rounded text-sm font-medium transition-all">
        <Download size={16} /> <span>Export PDF</span>
      </button>
    </div>

    {/* Education */}
    <section>
      <div className="flex items-center mb-6">
        <BookOpen className="text-cyan-500 mr-3" size={20}/> 
        <h3 className="text-xl font-bold text-white">Education</h3>
      </div>
      
      <div className="relative border-l border-zinc-800 ml-3 space-y-8 pb-4">
        <div className="ml-8 relative group">
          <div className="absolute -left-[37px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-cyan-500 group-hover:scale-125 transition-transform shadow-[0_0_8px_#06b6d4]"></div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-1">
            <div>
              <h4 className="text-lg font-bold text-white">HEC Paris & École Polytechnique</h4>
              <p className="text-zinc-400 text-sm">Dual Master's in Data Science & Finance</p>
            </div>
            <span className="text-sm font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-900/50 mt-2 md:mt-0">2025 - 2027</span>
          </div>
          <p className="text-zinc-600 text-xs mt-1">Paris, France</p>
        </div>

        <div className="ml-8 relative group">
          <div className="absolute -left-[37px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-zinc-600 group-hover:border-zinc-400 transition-colors"></div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-1">
            <div>
              <h4 className="text-lg font-bold text-white">Fudan University</h4>
              <p className="text-zinc-400 text-sm">Bachelor of Economics, Finance (GPA: 91/100)</p>
            </div>
            <span className="text-sm font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded mt-2 md:mt-0">2021 - 2025</span>
          </div>
          <p className="text-zinc-600 text-xs mt-1">Shanghai, China</p>
        </div>
      </div>
    </section>

    {/* Experience */}
    <section className="pt-6">
      <div className="flex items-center mb-6">
        <Briefcase className="text-cyan-500 mr-3" size={20}/> 
        <h3 className="text-xl font-bold text-white">Experience</h3>
      </div>

      <div className="grid gap-6">
        {[
          {
            company: "QianXiang Asset Management",
            role: "Quantitative Researcher Intern",
            team: "Equity Trading Team",
            period: "July 2024 – Nov 2024",
            points: [
              "Built a hot theme selection strategy using Hugging Face embeddings & clustering.",
              "Developed dynamic portfolio adjustment algorithms based on policy changes.",
              "Automated data scraping pipeline (Fiddler/Selenium)."
            ]
          },
          {
            company: "Pinnacle AI",
            role: "Quantitative Researcher Intern",
            team: "Alpha Team",
            period: "Nov 2023 - July 2024",
            points: [
              "Engineered non-linear pricing model using GANs for SDF estimation.",
              "Developed LLM-driven sentiment alpha (14% ann. return, >65% win rate).",
              "Constructed option-based signals (GEX, Open Interest)."
            ]
          },
          {
            company: "GuoTai Junan Security",
            role: "Analyst Intern",
            team: "Chemicals Industry",
            period: "June 2023 - Nov 2023",
            points: [
              "Authored reports on Spandex industry supply chains.",
              "Built visual databases for raw material inventory."
            ]
          }
        ].map((job, idx) => (
          <div key={idx} className="group bg-zinc-900/30 border border-zinc-800 hover:border-cyan-500/30 p-6 rounded-lg transition-all hover:bg-zinc-900/50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{job.company}</h4>
                <p className="text-zinc-400 font-medium text-sm">{job.role} <span className="text-zinc-600 mx-1">|</span> {job.team}</p>
              </div>
              <span className="text-xs font-mono text-zinc-500">{job.period}</span>
            </div>
            <ul className="space-y-2">
              {job.points.map((pt, i) => (
                <li key={i} className="text-sm text-zinc-400 flex items-start">
                  <span className="text-cyan-500 mr-2 mt-1.5 text-[10px]">●</span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const PortfolioPage = () => (
  <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
    <div className="mb-10">
      <h2 className="text-3xl font-bold text-white mb-2">Research Lab</h2>
      <p className="text-zinc-500 font-mono text-sm">From Hypothesis to Backtest.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Project Cards - Updated Styling */}
      {[
        {
          title: "Partisan Speech Recognition",
          tags: ["NLP", "Computer Vision", "PyTorch"],
          desc: "Fine-tuned Inception-v4 on ByteDance dataset to analyze fund manager sentiment via facial expressions and Twitter text.",
          color: "blue"
        },
        {
          title: "GAN-based SDF Estimation",
          tags: ["Deep Learning", "Asset Pricing", "Python"],
          desc: "Implemented a Generative Adversarial Network to estimate Stochastic Discount Factors, capturing non-linear risk premia.",
          color: "emerald"
        },
        {
          title: "Event-Driven Theme Strategy",
          tags: ["Web Scraping", "Clustering", "Strategy"],
          desc: "Monitoring algorithm using Baidu Index and TF-IDF to capture hot market themes and adjust portfolios dynamically.",
          color: "orange"
        }
      ].map((proj, idx) => (
        <div key={idx} className="bg-zinc-900/20 border border-zinc-800 hover:border-zinc-600 p-1 rounded-xl group transition-all duration-300">
          <div className="bg-black h-full rounded-lg p-6 flex flex-col relative overflow-hidden">
             {/* Hover Glow Effect */}
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>

             <div className="flex justify-between items-start mb-4 relative z-10">
               <h3 className="text-xl font-bold text-zinc-200 group-hover:text-white transition-colors">{proj.title}</h3>
               <ExternalLink size={16} className="text-zinc-600 group-hover:text-cyan-400 transition-colors" />
             </div>
             
             <p className="text-zinc-400 text-sm mb-6 leading-relaxed flex-1 relative z-10">
               {proj.desc}
             </p>
             
             <div className="flex flex-wrap gap-2 mt-auto relative z-10">
               {proj.tags.map((tag, tIdx) => (
                 <span key={tIdx} className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 rounded">
                   {tag}
                 </span>
               ))}
             </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const NetValuesPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6">
      {/* Status Bar */}
      <div className="flex justify-between items-center bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg backdrop-blur-sm">
        <div>
          <h2 className="text-xl font-bold text-white">Alpha Monitor</h2>
          <p className="text-xs text-zinc-500 font-mono">STRATEGY: MULTI-FACTOR NEUTRAL</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-emerald-400">+25.0% <span className="text-xs text-zinc-500 ml-1">YTD</span></div>
          <div className="text-xs text-zinc-500 font-mono">SHARPE: 2.4 | DRAWDOWN: -3.2%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-50"></div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_PNL_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#52525b" 
                  tick={{fill: '#52525b', fontSize: 10, fontFamily: 'monospace'}} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#52525b" 
                  tick={{fill: '#52525b', fontSize: 10, fontFamily: 'monospace'}} 
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#000', borderColor: '#333', color: '#fff', borderRadius: '4px'}}
                  itemStyle={{color: '#22d3ee', fontFamily: 'monospace'}}
                  cursor={{stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 4'}}
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
          </div>
        </div>

        {/* Stats/Pie */}
        <div className="space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
             <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest absolute top-4 left-4">Allocation</h3>
             <div className="w-full h-[200px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={MOCK_POSITIONS}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="weight"
                      stroke="none"
                    >
                      {MOCK_POSITIONS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: '#000', borderColor: '#333', borderRadius: '4px', fontSize: '12px'}} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-full grid grid-cols-2 gap-2 mt-2">
               {MOCK_POSITIONS.map((pos, idx) => (
                 <div key={idx} className="flex items-center justify-between px-2 py-1 bg-zinc-900 rounded text-[10px] text-zinc-400">
                   <span className="flex items-center"><div className="w-1.5 h-1.5 rounded-full mr-2" style={{backgroundColor: COLORS[idx]}}></div>{pos.ticker}</span>
                   <span className="font-mono">{pos.weight}%</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Data Table - Terminal Style */}
      <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden font-mono text-sm">
        <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
           <span className="text-zinc-400 text-xs">&gt; SELECT * FROM PORTFOLIO_HOLDINGS</span>
           <ExternalLink size={12} className="text-zinc-600 cursor-pointer hover:text-cyan-400"/>
        </div>
        <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-xs border-b border-zinc-800">
                <th className="px-6 py-3 font-normal">SYMBOL</th>
                <th className="px-6 py-3 font-normal">ASSET</th>
                <th className="px-6 py-3 font-normal text-right">WGT</th>
                <th className="px-6 py-3 font-normal text-right">PNL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {MOCK_POSITIONS.map((pos, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/40 transition-colors group">
                  <td className="px-6 py-3 text-cyan-500 group-hover:text-cyan-300">{pos.ticker}</td>
                  <td className="px-6 py-3 text-zinc-400">{pos.name}</td>
                  <td className="px-6 py-3 text-zinc-500 text-right">{pos.weight}%</td>
                  <td className={`px-6 py-3 text-right font-bold ${pos.pnl.includes('+') ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {pos.pnl}
                  </td>
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
