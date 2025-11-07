import React, { useState, useContext } from 'react';
import SymptomChecker from './components/SymptomChecker';
import HealthTracker from './components/HealthTracker';
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import SettingsPage from './components/SettingsPage';
import { SettingsProvider, SettingsContext } from './contexts/SettingsContext';
import { Icon } from './components/common/Icon';

type View = 'home' | 'checker' | 'tracker' | 'about' | 'settings';

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const { theme } = useContext(SettingsContext);

  const NavButton: React.FC<{
    targetView: View;
    icon: any;
    label: string;
  }> = ({ targetView, icon, label }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex-1 sm:flex-initial sm:flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 ease-in-out border-b-2 ${
        view === targetView
          ? 'border-primary text-primary'
          : 'border-transparent text-slate-500 hover:text-primary hover:bg-slate-100'
      }`}
    >
      <Icon name={icon} className="w-5 h-5" />
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
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
             <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
              <Icon name="logo" className="w-8 h-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Health AI
              </h1>
            </div>
            <div className="flex items-center">
              <nav className="hidden sm:flex sm:items-center sm:space-x-2">
                <NavButton targetView="home" icon="home" label="Home" />
                <NavButton targetView="checker" icon="clipboard" label="Symptom Checker" />
                <NavButton targetView="tracker" icon="calendar" label="Health Tracker" />
                <NavButton targetView="about" icon="info" label="About Us" />
              </nav>
              <button
                onClick={() => setView('settings')}
                className={`ml-4 p-2 rounded-full transition-colors duration-200 ${
                  view === 'settings' ? 'bg-primary-light text-primary' : 'text-slate-500 hover:bg-slate-100'
                }`}
                aria-label="Settings"
              >
                <Icon name="settings" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-[0_-2px_5px_rgba(0,0,0,0.05)] flex justify-around z-20">
          <NavButton targetView="home" icon="home" label="Home" />
          <NavButton targetView="checker" icon="clipboard" label="Checker" />
          <NavButton targetView="tracker" icon="calendar" label="Tracker" />
          <NavButton targetView="about" icon="info" label="About" />
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:pb-8 pb-24">
        {renderView()}
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