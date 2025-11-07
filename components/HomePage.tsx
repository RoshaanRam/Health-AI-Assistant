import React from 'react';
import { Icon } from './common/Icon';

interface HomePageProps {
  setView: (view: 'checker' | 'tracker') => void;
}

const FeatureCard: React.FC<{ icon: any; title: string; description: string; }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center flex flex-col items-center">
    <div className="bg-primary-light p-3 rounded-full mb-4">
      <Icon name={icon} className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  return (
    <div className="space-y-12">
      <div className="text-center py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-4">
          Your Personal Health Companion
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8">
          Leverage the power of AI to understand your symptoms, track your health patterns, and gain valuable insights for a healthier life.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setView('checker')}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition"
          >
            Check Symptoms Now
          </button>
          <button
            onClick={() => setView('tracker')}
            className="px-8 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition"
          >
            Track Your Health
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon="clipboard" 
          title="Symptom Checker" 
          description="Describe your symptoms in plain language and get an AI-powered analysis of possible causes and suggestions." 
        />
        <FeatureCard 
          icon="calendar" 
          title="Health Tracker" 
          description="Log your daily health status, monitor trends over time with our calendar and chart views." 
        />
        <FeatureCard 
          icon="sparkles" 
          title="AI Insights" 
          description="Let our AI analyze your health logs to identify patterns and provide personalized insights for your well-being." 
        />
      </div>
    </div>
  );
};

export default HomePage;