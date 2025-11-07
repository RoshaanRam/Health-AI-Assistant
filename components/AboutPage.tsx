import React from 'react';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';

const InfoSection: React.FC<{icon: any, title: string, children: React.ReactNode}> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex items-start gap-4">
        <div className="flex-shrink-0 bg-primary-light p-3 rounded-full">
            <Icon name={icon} className="w-6 h-6 text-primary" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
            <div className="text-slate-600 space-y-2">{children}</div>
        </div>
    </div>
);

const AboutPage: React.FC = () => {
  const { t } = useTranslations();
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t('about.title')}</h2>
        <p className="text-lg text-slate-600">
          {t('about.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <InfoSection icon="logo" title={t('about.missionTitle')}>
          <p>
            {t('about.missionText')}
          </p>
        </InfoSection>

        <InfoSection icon="sparkles" title={t('about.howItWorksTitle')}>
           <p>
            {t('about.howItWorksText')}
          </p>
        </InfoSection>

        <InfoSection icon="info" title={t('about.disclaimerTitle')}>
            <p>
                {t('about.disclaimerText')}
            </p>
        </InfoSection>
      </div>
    </div>
  );
};

export default AboutPage;