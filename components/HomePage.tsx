import React from 'react';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';

interface HomePageProps {
  setView: (view: 'checker' | 'tracker') => void;
}

const FeatureCard: React.FC<{ icon: any; title: string; description: string; }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 text-center flex flex-col items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <div className="bg-primary-light p-3 rounded-full mb-4">
      <Icon name={icon} className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm">{description}</p>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
  const { t } = useTranslations();
  return (
    <div className="space-y-12">
      <div className="text-center py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-4">
          {t('home.title')}
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-8">
          {t('home.subtitle')}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setView('checker')}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {t('home.checkerButton')}
          </button>
          <button
            onClick={() => setView('tracker')}
            className="px-8 py-3 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            {t('home.trackerButton')}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon="clipboard" 
          title={t('home.feature1Title')}
          description={t('home.feature1Desc')}
        />
        <FeatureCard 
          icon="calendar" 
          title={t('home.feature2Title')}
          description={t('home.feature2Desc')}
        />
        <FeatureCard 
          icon="sparkles" 
          title={t('home.feature3Title')}
          description={t('home.feature3Desc')}
        />
      </div>
    </div>
  );
};

export default HomePage;