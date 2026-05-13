export const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'EN', name: 'English', description: 'Operate the site in English copy.' },
  { id: 'zh', label: '中', name: '中文', description: '切换到中文界面，查看本地化内容。' },
];

export const uiText = {
  en: {
    brandName: { primary: 'Yuhan', accent: 'Wu' },
    brandTagline: 'Yuhan Wu — LLM × Quant Research',
    feedLive: 'FEED · LIVE',
    nav: {
      about: 'About',
      resume: 'Resume',
      portfolio: 'Portfolio',
      live: 'Live Alpha',
      contact: 'Contact',
    },
    connect: 'Connect',
    languagePanelTitle: 'Language',
    languagePanelDesc: 'Switch between English and Chinese instantly.',
  },
  zh: {
    brandName: { primary: '吴雨函', accent: '' },
    brandTagline: '吴雨函 — LLM 量化研究',
    feedLive: '数据流 · 实时',
    nav: {
      about: '关于',
      resume: '简历',
      portfolio: '组合',
      live: '净值面板',
      contact: '联系',
    },
    connect: '联系我',
    languagePanelTitle: '语言切换',
    languagePanelDesc: '一键在英文与中文内容间切换。',
  },
};

export const heroContent = {
  en: {
    eyebrow: 'FEED · LIVE — 2026 / PARIS',
    slogan: 'Building language-model alpha from market narratives',
    name: 'Yuhan Wu',
    role: 'LLM Quant Research · HEC Paris × École Polytechnique',
    cta: 'Connect',
    secondaryCta: 'View live alpha',
    scrollHint: 'Scroll',
  },
  zh: {
    eyebrow: '数据流 · 实时 — 2026 / 巴黎',
    slogan: '用大语言模型理解市场叙事与 Alpha',
    name: '吴雨函',
    role: 'LLM 量化研究 · HEC Paris × 巴黎综合理工',
    cta: '联系我',
    secondaryCta: '查看净值面板',
    scrollHint: '向下',
  },
};

export const manifestoContent = {
  en: {
    number: '01',
    kicker: 'About',
    pullQuote: 'Turning market narratives into model-readable alpha signals.',
    techTitle: 'Practice',
    techStacks: [
      {
        title: 'Quant Core',
        summary: 'Asset pricing, cross-sectional signals, portfolio construction, risk modeling.',
        skills: ['Asset Pricing', 'Cross-sectional Alpha', 'Portfolio Optimization', 'Risk Modeling'],
        icon: 'cpu',
      },
      {
        title: 'LLM & Financial AI',
        summary: 'Financial LLMs for news, filings, events, sentiment, and thematic signals.',
        skills: ['LLM Fine-tuning', 'RAG', 'Embedding Retrieval', 'Model Distillation', 'Financial NLP'],
        icon: 'terminal',
      },
      {
        title: 'LLM Systems',
        summary: 'Data, training, retrieval, and inference pipelines from raw text to signals.',
        skills: ['Python', 'PyTorch', 'vLLM', 'FAISS / Milvus', 'DeepSpeed'],
        icon: 'database',
      },
    ],
    aboutTitle: 'A short note',
    aboutParagraphs: [
      'I am a dual-degree candidate in Data Science & Finance at HEC Paris and École Polytechnique, blending the precision of engineering with financial intuition. My academic foundation was built at Fudan University (Economics & Finance).',
      'My work centers on LLM-native alpha research: converting news, policy texts, social narratives, and market microstructure into event representations, retrieval features, and rank signals. I enjoy the patient work of turning language into measurable market structure.',
    ],
  },
  zh: {
    number: '01',
    kicker: '关于',
    pullQuote: '把市场叙事转化为模型可理解的 Alpha 信号。',
    techTitle: '我所做的',
    techStacks: [
      {
        title: '量化核心',
        summary: '资产定价、横截面信号、组合构建与风险建模。',
        skills: ['资产定价', '横截面 Alpha', '投资组合优化', '风险建模'],
        icon: 'cpu',
      },
      {
        title: 'LLM 与金融智能',
        summary: '面向新闻、公告、事件流与市场情绪的金融大语言模型。',
        skills: ['大模型微调', 'RAG', '向量检索', '模型蒸馏', '金融 NLP'],
        icon: 'terminal',
      },
      {
        title: '大模型工程',
        summary: '从原始文本到信号的训练、检索、推理与评测链路。',
        skills: ['Python', 'PyTorch', 'vLLM', 'FAISS / Milvus', 'DeepSpeed'],
        icon: 'database',
      },
    ],
    aboutTitle: '一段简述',
    aboutParagraphs: [
      '我正在 HEC Paris 与巴黎综合理工学院攻读数据科学和金融双学位，将工程的严谨与金融直觉结合。此前在复旦大学经济学院（金融方向）打下金融学基础。',
      '我关注 LLM 与 Alpha 挖掘的交叉点：把财经新闻、政策文本、社交叙事与市场微观结构转化为事件表示、检索特征与排序信号。我喜欢把语言中的复杂结构，稳稳地落到可验证的量化研究里。',
    ],
  },
};

export const resumeContent = {
  en: {
    number: '02',
    kicker: 'Resume',
    title: 'Curriculum vitae',
    subtitle:
      'Data & Finance dual-degree candidate focused on LLM-native alpha research — retrieval-augmented financial NLP, instruction-tuned event understanding, representation distillation, and scalable inference for news-to-return prediction, thematic rotation, and market-narrative monitoring.',
    openPdf: 'Open PDF',
    contact: 'Yuhan Wu  ·  contact.yuhan@gmail.com  ·  +33 749 845 277',
    educationTitle: 'Education',
    experienceTitle: 'Internship Experience',
    projectTitle: 'Project Experience',
    skillsTitle: 'Skills & Other',
    education: [
      {
        school: 'HEC Paris & École Polytechnique',
        location: 'Paris, France',
        period: 'September 2025 — June 2027',
        title: "Dual Master's Degree in Data Science & Finance",
        note: 'Core courses: Machine Learning, Deep Learning and Optimization, Algorithmic Trading, Stochastic Calculus, Asset Pricing.',
      },
      {
        school: 'Fudan University, School of Economics',
        location: 'Shanghai, China',
        period: 'September 2021 — June 2025',
        title: 'Bachelor of Economics, Finance',
        note: 'Core courses: Machine Learning, Stochastic Processes, Financial Engineering & Derivatives Pricing, Algorithms.',
      },
    ],
    experiences: [
      {
        company: 'Yanfu Investment',
        location: 'Shanghai, China',
        title: 'Data Scientist Intern, Data Science Department',
        period: 'March 2026 — Present',
        bullets: [
          'Designed an LLM-native news-to-return framework for A-share equities: fine-tuned domain encoders and rerankers on Chinese financial news, aligned articles to tickers and events, and optimized contrastive / listwise ranking objectives to convert unstructured narratives into forward-looking cross-sectional return signals. The framework currently reaches an out-of-sample Rank IC of approximately 0.10, with architecture and training-data refinement underway.',
          'Built a production-oriented distillation and inference stack for concept classification: used teacher LLMs to generate taxonomy labels and rationales, distilled response-level and feature-level knowledge into lightweight student encoders, and served high-throughput thematic tagging for downstream alpha research.',
        ],
      },
      {
        company: 'Qianxiang Asset Management',
        location: 'Shanghai, China',
        title: 'Quantitative Researcher Intern, LLM Alpha Team',
        period: 'Nov 2023 — Jul 2024  ·  Jan 2025 — Mar 2025',
        bullets: [
          'Built a financial text representation stack using domain-adapted transformers, embedding retrieval, and weak supervision to transform investor sentiment, retail-attention discourse, comment-volume dynamics, and option-implied positioning into multi-horizon alpha signals for short-horizon trading and thematic screening.',
          'Designed text-derived state variables for nonlinear asset pricing: clustered financial-news embeddings into narrative regimes, fused them with high-dimensional firm characteristics in a no-arbitrage neural SDF framework, and captured interaction structures that linear factor models struggle to express.',
          'Engineered macro and micro-structural predictive factors with recurrent and attention-based models; incorporated LLM-classified macro events, supply-chain network embeddings, and momentum cascades to improve systematic risk decomposition and theme-level signal attribution.',
        ],
      },
      {
        company: 'Qianxiang Asset Management',
        location: 'Shanghai, China',
        title: 'Quantitative Researcher Intern, Equity Trading Team',
        period: 'Aug 2024 — Oct 2024',
        bullets: [
          'Designed an LLM-driven theme-discovery engine: combined sentence-transformer embeddings, cross-encoder reranking, and hierarchical topic clustering to organize financial news into latent narrative spaces; built a real-time theme-heat monitor that surfaced emerging market stories for alpha discovery.',
          'Constructed an event-driven thematic-rotation model by prompting instruction-tuned LLMs to encode policy shifts, macro releases, and earnings signals into structured event schemas; developed a correlation-aware rotation framework over event taxonomies, cross-theme dependency graphs, and dynamic importance weights.',
          'Built an automated data-ingestion pipeline for policy texts, event streams, and market narratives at scale; normalized raw text into analytics-ready corpora for financial NLP factors, event studies, and retrieval-based strategy research.',
        ],
      },
    ],
    projects: [
      {
        title: 'Fund Manager Partisan Speech Recognition',
        role: "Research Assistant · Prof. Lin Sun — Fudan University FISF",
        location: 'Shanghai, China',
        period: 'Sep 2023 — Aug 2024',
        bullets: [
          'Built an LLM-assisted text-analytics pipeline that harvested and structured a decade of public communications from U.S. lawmakers and institutional fund managers; engineered stance-classification and partisan-drift inference modules on top of transformer embeddings, surfacing ideological and behavioral patterns from raw speech.',
          'Designed and fine-tuned a vision-language fusion model to interpret emotional signals in images paired with financial commentary; integrated multimodal representations with text sentiment and discourse features for downstream quantitative analysis.',
        ],
      },
    ],
    skills: [
      { label: 'Languages', value: 'English (IELTS 7.5, GRE 323), Mandarin (Native), French (Beginner)' },
      { label: 'LLM & Engineering', value: 'Python, PyTorch, C++; financial NLP, transformer / LLM fine-tuning (LoRA / QLoRA), instruction tuning, RAG, embedding retrieval and reranking (FAISS / Milvus / cross-encoders), model distillation, evaluation (Rank IC / retrieval metrics), scalable inference (vLLM), distributed training (FSDP / DeepSpeed).' },
      { label: 'Certifications', value: 'C++ Programming for Financial Engineering (with Distinction), Baruch College' },
    ],
  },
  zh: {
    number: '02',
    kicker: '简历',
    title: '履历',
    subtitle:
      '数据与金融双学位，专注于 LLM-native Alpha 研究：检索增强金融 NLP、指令微调事件理解、表示蒸馏与可扩展推理，应用于新闻-收益预测、主题轮动与市场叙事监控。',
    openPdf: '打开 PDF',
    contact: '吴雨函  ·  contact.yuhan@gmail.com  ·  +33 749 845 277',
    educationTitle: '教育经历',
    experienceTitle: '实习经历',
    projectTitle: '项目经历',
    skillsTitle: '技能与其他',
    education: [
      {
        school: 'HEC Paris 与巴黎综合理工学院',
        location: '巴黎，法国',
        period: '2025 年 9 月 — 2027 年 6 月',
        title: '数据科学与金融双硕士',
        note: '核心课程：机器学习、深度学习与优化、算法交易、随机微积分、资产定价。',
      },
      {
        school: '复旦大学 经济学院',
        location: '上海，中国',
        period: '2021 年 9 月 — 2025 年 6 月',
        title: '经济学学士，金融',
        note: '核心课程：机器学习、随机过程、金融工程与衍生品定价、算法。',
      },
    ],
    experiences: [
      {
        company: '衍复投资',
        location: '上海，中国',
        title: '数据科学部，数据科学实习生',
        period: '2026.03 — 至今',
        bullets: [
          '为 A 股权益设计 LLM-native 新闻收益预测框架：在中文财经新闻上微调领域编码器与重排序模型，将新闻对齐到股票与事件，并通过对比学习 / listwise ranking 目标把非结构化叙事转化为前瞻性的横截面收益信号；样本外 Rank IC 约 0.10，模型结构与训练数据持续迭代中。',
          '搭建面向生产的概念分类蒸馏与推理链路：用教师 LLM 生成概念标签与解释理由，通过响应蒸馏和特征蒸馏迁移到轻量学生编码器，在保持分类质量的同时实现高吞吐主题打标，支撑下游 Alpha 研究。',
        ],
      },
      {
        company: '千象资产',
        location: '上海，中国',
        title: '量化研究员实习生，LLM Alpha 组',
        period: '2023.11 — 2024.07  ·  2025.01 — 2025.03',
        bullets: [
          '搭建金融文本表示栈，结合领域适配 Transformer、向量检索与弱监督标注，将投资者情绪、散户关注度、评论量动态和期权隐含仓位等异构另类数据转化为多周期 Alpha 信号，服务短周期交易与主题筛选。',
          '设计文本派生状态变量用于非线性资产定价：对财经新闻嵌入进行聚类，提取市场叙事 regime，并与高维公司特征融合到无套利神经 SDF 框架中，捕捉线性因子模型难以表达的交互结构。',
          '用循环网络与注意力模型构造宏观和微观结构预测因子；引入 LLM 分类后的宏观事件、供应链网络嵌入与动量级联特征，提升系统性风险分解和主题级信号归因能力。',
        ],
      },
      {
        company: '千象资产',
        location: '上海，中国',
        title: '量化研究员实习生，股票交易组',
        period: '2024.08 — 2024.10',
        bullets: [
          '设计 LLM 驱动的主题挖掘引擎：结合 sentence-transformer 嵌入、cross-encoder 重排序与层次主题聚类，结构化财经新闻的潜在叙事空间；搭建实时主题热度监控系统，为 Alpha 挖掘捕捉新兴市场叙事。',
          '用指令微调 LLM 将政策变化、宏观发布和业绩信号编码为结构化事件 schema；基于事件分类法、跨主题依赖图与动态重要度权重，构建相关性敏感的题材轮动框架。',
          '搭建自动化数据采集管道，规模化获取政策文本、事件流与市场叙事；将原始文本规范化为可用于金融 NLP 因子、事件研究与检索式策略研究的语料库。',
        ],
      },
    ],
    projects: [
      {
        title: '基金经理政治倾向识别',
        role: '研究助理 · 孙霖教授，复旦大学泛海国际金融学院',
        location: '上海，中国',
        period: '2023.09 — 2024.08',
        bullets: [
          '搭建 LLM 辅助的大规模文本分析流水线，抓取并结构化美国议员与机构基金经理十年公开发言；在 Transformer 嵌入之上构建立场分类与党派漂移推断模块，从原始言论中提取意识形态与行为模式。',
          '设计并微调视觉-语言融合模型，解读金融评论配图中的情绪信号；将多模态表示与文本情绪、话语特征融合，构建下游量化分析的行为特征。',
        ],
      },
    ],
    skills: [
      { label: '语言', value: '英语（IELTS 7.5，GRE 323），中文（母语），法语（初级）' },
      { label: '大模型与工程', value: 'Python, PyTorch, C++；金融 NLP、Transformer / LLM 微调（LoRA / QLoRA）、指令微调、RAG、向量检索与重排序（FAISS / Milvus / cross-encoder）、模型蒸馏、评测（Rank IC / 检索指标）、可扩展推理（vLLM）、分布式训练（FSDP / DeepSpeed）。' },
      { label: '证书', value: 'C++ 金融工程（优等），巴鲁克学院' },
    ],
  },
};

export const portfolioCopy = {
  en: {
    number: '03',
    kicker: 'Portfolio',
    title: 'Holdings',
    subtitle: 'Synced with portfolio.csv. No hard-coded rows.',
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
    number: '03',
    kicker: '组合',
    title: '持仓',
    subtitle: '与 portfolio.csv 同步。无硬编码行。',
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

export const netValuesCopy = {
  en: {
    number: '04',
    kicker: 'Live Alpha',
    title: 'Strategy monitor',
    feedBadge: 'CSV FEED',
    source: 'Source: data/net_values.csv & portfolio.csv',
    latestLabel: 'LATEST NET VALUE',
    performanceTag: 'PERFORMANCE TRACKING',
    chartTitle: 'Strategy net values',
    chartBadge: 'Backtested CSV',
    loading: 'Loading net values from CSV…',
    error: 'Unable to load net values from CSV.',
    empty: 'No data available in net_values.csv',
    allocation: 'Allocation',
    noWeights: 'No weights found.',
    waiting: 'Waiting for CSV',
    tooltipLabel: 'Net Value',
    portfolioLoading: 'Loading portfolio.csv…',
    portfolioError: 'Unable to load portfolio holdings.',
  },
  zh: {
    number: '04',
    kicker: '净值面板',
    title: '策略监控',
    feedBadge: 'CSV 数据流',
    source: '数据源：data/net_values.csv 与 portfolio.csv',
    latestLabel: '最新净值',
    performanceTag: '绩效跟踪',
    chartTitle: '策略净值',
    chartBadge: '回测 CSV',
    loading: '正在从 CSV 加载净值…',
    error: '无法从 CSV 加载净值。',
    empty: 'net_values.csv 中暂无数据',
    allocation: '组合权重',
    noWeights: '没有权重数据。',
    waiting: '等待 CSV',
    tooltipLabel: '净值',
    portfolioLoading: '正在加载 portfolio.csv…',
    portfolioError: '无法加载组合持仓。',
  },
};

export const tableHeaders = {
  en: { ticker: 'TICKER', asset: 'ASSET', weight: 'WEIGHT', reason: 'REASON', totalPrefix: 'Total weight' },
  zh: { ticker: '代码', asset: '资产', weight: '权重', reason: '理由', totalPrefix: '总权重' },
};

export const chartRangeLabels = {
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

export const contactContent = {
  en: {
    number: '05',
    kicker: 'Contact',
    title: 'Let us talk',
    description:
      'I am open to conversations on LLM-driven quant research, financial NLP, market-narrative modeling, and alpha systems — especially from March 2026 onward in Paris.',
    email: 'Email',
    linkedin: 'LinkedIn',
    cv: 'Download CV',
    sloganRepeat: 'Building language-model alpha from market narratives.',
    copyright: '© 2026 Yuhan Wu. All quietly engineered.',
  },
  zh: {
    number: '05',
    kicker: '联系',
    title: '欢迎聊聊',
    description:
      '欢迎讨论 LLM 驱动的量化研究、金融 NLP、市场叙事建模与 Alpha 系统 —— 尤其是 2026 年 3 月起在巴黎的实习机会。',
    email: '邮箱',
    linkedin: 'LinkedIn',
    cv: '下载简历',
    sloganRepeat: '用大语言模型理解市场叙事与 Alpha。',
    copyright: '© 2026 吴雨函 · 安静地构建',
  },
};
