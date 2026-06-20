import React, { useState } from 'react';
import Grain from './components/Grain';
import NavBar from './components/NavBar';
import BlackHoleHero from './components/BlackHoleHero';
import ManifestoSection from './sections/ManifestoSection';
import ResumeSection from './sections/ResumeSection';
import PortfolioSection from './sections/PortfolioSection';
import LiveAlphaSection from './sections/LiveAlphaSection';
import ContactFooter from './sections/ContactFooter';
import StrategyMonitorApp from './monitor/StrategyMonitorApp';

const isMonitorSurface = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.startsWith('quant.')
    || window.location.pathname.startsWith('/strategy-monitor')
    || window.location.pathname.startsWith('/quant-monitor')
  );
};

const App = () => {
  const [language, setLanguage] = useState('en');

  if (isMonitorSurface()) {
    return <StrategyMonitorApp language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="relative min-h-screen bg-ink-950 text-bone-100 font-sans overflow-x-hidden">
      <Grain />
      <NavBar language={language} setLanguage={setLanguage} />

      <main>
        <BlackHoleHero language={language} />
        <ManifestoSection language={language} />
        <ResumeSection language={language} />
        <PortfolioSection language={language} />
        <LiveAlphaSection language={language} />
        <ContactFooter language={language} />
      </main>
    </div>
  );
};

export default App;
