
import React, { useState } from 'react';
import SymptomChecker from './components/SymptomChecker';
import HealthTracker from './components/HealthTracker';
import { Icon } from './components/common/Icon';

type View = 'checker' | 'tracker';

const App: React.FC = () => {
  const [view, setView] = useState<View>('checker');

  const NavButton: React.FC<{
    currentView: View;
    targetView: View;
    onClick: () => void;
    icon: 'clipboard' | 'calendar';
    label: string;
  }> = ({ currentView, targetView, onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out rounded-t-lg ${
        currentView === targetView
          ? 'bg-white text-blue-600 shadow-md border-b-2 border-blue-600'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
      }`}
    >
      <Icon name={icon} className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
              Health AI Assistant
            </h1>
          </div>
          <nav className="mt-4 flex space-x-2 border-b border-slate-200">
            <NavButton
              currentView={view}
              targetView="checker"
              onClick={() => setView('checker')}
              icon="clipboard"
              label="Symptom Checker"
            />
            <NavButton
              currentView={view}
              targetView="tracker"
              onClick={() => setView('tracker')}
              icon="calendar"
              label="Health Tracker"
            />
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'checker' ? <SymptomChecker /> : <HealthTracker />}
      </main>
    </div>
  );
};

export default App;
