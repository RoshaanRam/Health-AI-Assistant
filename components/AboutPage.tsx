import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

const AboutPage: React.FC = () => {
    const { t } = useTranslations();

  const InfoCard: React.FC<{ title: string; text: string; children?: React.ReactNode }> = ({ title, text, children }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-themed-sm">
      <h2 className="text-2xl font-bold text-slate-800 mb-3">{title}</h2>
      <p className="text-slate-600 leading-relaxed">{text}</p>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {t('about.title')}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          {t('about.subtitle')}
        </p>
      </div>
      
      <InfoCard title={t('about.missionTitle')} text={t('about.missionText')} />
      
      <InfoCard title={t('about.howItWorksTitle')} text={t('about.howItWorksText')} />

      <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 text-red-800 p-6 rounded-xl shadow-sm" role="alert">
         <h2 className="text-2xl font-bold mb-3">{t('about.disclaimerTitle')}</h2>
         <p className="leading-relaxed">{t('about.disclaimerText')}</p>
      </div>
    </div>
  );
};

export default AboutPage;
