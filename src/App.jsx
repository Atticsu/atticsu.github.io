import React, { useState } from 'react';
import Grain from './components/Grain';
import NavBar from './components/NavBar';
import BlackHoleHero from './components/BlackHoleHero';
import ManifestoSection from './sections/ManifestoSection';
import ResumeSection from './sections/ResumeSection';
import PortfolioSection from './sections/PortfolioSection';
import LiveAlphaSection from './sections/LiveAlphaSection';
import ContactFooter from './sections/ContactFooter';

const App = () => {
  const [language, setLanguage] = useState('en');

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
