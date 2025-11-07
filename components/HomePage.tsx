import React from 'react';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';

interface HomePageProps {
  setView: (view: 'checker' | 'tracker') => void;
}

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
    const { t } = useTranslations();

  const FeatureCard: React.FC<{ icon: any; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-themed-sm hover:shadow-themed-md transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-center bg-primary-light w-12 h-12 rounded-full mb-4">
        <Icon name={icon} className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );

  return (
    <div className="text-center">
      <div className="py-12 sm:py-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            {t('home.title')}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
            {t('home.subtitle')}
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => setView('checker')}
            className="w-full sm:w-auto bg-primary text-white font-semibold py-3 px-8 rounded-full shadow-themed-md hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Icon name="clipboard" className="w-5 h-5"/>
            <span>{t('home.checkerButton')}</span>
          </button>
          <button
            onClick={() => setView('tracker')}
            className="w-full sm:w-auto bg-white text-slate-700 font-semibold py-3 px-8 rounded-full border border-slate-300 hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
             <Icon name="calendar" className="w-5 h-5"/>
             <span>{t('home.trackerButton')}</span>
          </button>
        </div>
      </div>

      <div className="py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon="clipboard" title={t('home.feature1Title')} description={t('home.feature1Desc')} />
          <FeatureCard icon="calendar" title={t('home.feature2Title')} description={t('home.feature2Desc')} />
          <FeatureCard icon="sparkles" title={t('home.feature3Title')} description={t('home.feature3Desc')} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
