import React, { useState, useContext } from 'react';
import SymptomChecker from './components/SymptomChecker';
import HealthTracker from './components/HealthTracker';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import SettingsPage from './components/SettingsPage';
import { SettingsProvider, SettingsContext } from './contexts/SettingsContext';
import { Icon } from './components/common/Icon';
import { useTranslations } from './hooks/useTranslations';

type View = 'home' | 'checker' | 'tracker' | 'about' | 'settings';

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const { theme } = useContext(SettingsContext);
  const { t } = useTranslations();

  const NavButton: React.FC<{
    targetView: View;
    icon: any;
    label: string;
  }> = ({ targetView, icon, label }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex-1 sm:flex-initial sm:flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out border-b-2 group ${
        view === targetView
          ? 'border-primary text-primary'
          : 'border-transparent text-slate-500 hover:text-primary hover:bg-slate-100/50'
      }`}
    >
      <Icon name={icon} className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
      <span>{label}</span>
    </button>
  );

  const renderView = () => {
    switch (view) {
      case 'home':
        return <HomePage setView={setView} />;
      case 'checker':
        return <SymptomChecker />;
      case 'tracker':
        return <HealthTracker />;
      case 'about':
        return <AboutPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <header
        className="backdrop-blur-lg sticky top-0 z-10 shadow-themed-sm"
        style={{ background: 'var(--navbar-background)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
              <Icon name="logo" className="w-8 h-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                {t('app.title')}
              </h1>
            </div>
            <div className="flex items-center">
              <nav className="hidden sm:flex sm:items-center sm:space-x-2">
                <NavButton targetView="home" icon="home" label={t('nav.home')} />
                <NavButton targetView="checker" icon="clipboard" label={t('nav.checker')} />
                <NavButton targetView="tracker" icon="calendar" label={t('nav.tracker')} />
                <NavButton targetView="about" icon="info" label={t('nav.about')} />
              </nav>
              <button
                onClick={() => setView('settings')}
                className={`ml-4 p-2 rounded-full transition-colors duration-200 group ${
                  view === 'settings' ? 'bg-primary-light text-primary' : 'text-slate-500 hover:bg-slate-100/50'
                }`}
                aria-label={t('nav.settings')}
              >
                <Icon name="settings" className="w-6 h-6 transition-transform duration-300 group-hover:rotate-45" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 backdrop-blur-lg flex justify-around z-20"
        style={{ background: 'var(--navbar-background)', boxShadow: '0 -2px 5px var(--shadow-color)' }}
      >
          <NavButton targetView="home" icon="home" label={t('nav.home')} />
          <NavButton targetView="checker" icon="clipboard" label={t('nav.checkerShort')} />
          <NavButton targetView="tracker" icon="calendar" label={t('nav.trackerShort')} />
          <NavButton targetView="about" icon="info" label={t('nav.aboutShort')} />
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:pb-8 pb-24">
        <div key={view} className="page-enter-active">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <SettingsProvider>
    <AppContent />
  </SettingsProvider>
);

export default App;