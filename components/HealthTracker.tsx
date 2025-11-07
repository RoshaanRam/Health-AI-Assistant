import React, { useState, useMemo, useContext } from 'react';
import { HealthLog } from '../types';
import CalendarView from './CalendarView';
import HealthChart from './HealthChart';
import { getHealthAnalysis } from '../services/geminiService';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';
import { SettingsContext } from '../contexts/SettingsContext';

const HealthTracker: React.FC = () => {
  const [healthLogs, setHealthLogs] = useState<Record<string, HealthLog>>({
    '2024-07-15': { id: '1', date: '2024-07-15', log: 'Feeling tired, slight headache in the afternoon.', summary: '😴 Tired with a headache', symptomSeverity: 4 },
    '2024-07-18': { id: '2', date: '2024-07-18', log: 'Felt great today, went for a 3-mile run.', summary: '🏃‍♂️ Energetic, went for a run', symptomSeverity: 1 },
    '2024-07-22': { id: '3', date: '2024-07-22', log: 'Woke up with a sore throat and stuffy nose.', summary: '🤒 Cold symptoms', symptomSeverity: 6 },
    '2024-07-23': { id: '4', date: '2024-07-23', log: 'Sore throat is worse, but nose is clearer. Took some honey lemon tea.', summary: '😷 Sore throat persists', symptomSeverity: 7 },
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useContext(SettingsContext);
  const { t } = useTranslations();

  const handleLogsUpdate = (newLogs: Record<string, HealthLog>) => {
    setHealthLogs(newLogs);
  };
  
  const handleAnalyze = async () => {
      if (Object.keys(healthLogs).length === 0) {
          setError(t('healthTracker.error.noLogs'));
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
          const result = await getHealthAnalysis(Object.values(healthLogs), language);
          setAnalysis(result);
      } catch (err) {
          setError(err instanceof Error ? err.message : t('healthTracker.error.unknown'));
      } finally {
          setIsLoading(false);
      }
  };

  const formattedChartData = useMemo(() => {
    return Object.values(healthLogs)
      // Fix: Add explicit types for sort and map callback arguments to resolve type inference issues.
      .sort((a: HealthLog, b: HealthLog) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((log: HealthLog) => ({
        date: new Date(log.date).toLocaleDateString(language, { month: 'short', day: 'numeric' }),
        severity: log.symptomSeverity,
      }));
  }, [healthLogs, language]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('healthTracker.calendarTitle')}</h2>
        <CalendarView
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          healthLogs={healthLogs}
          onLogsUpdate={handleLogsUpdate}
        />
      </div>
      
      <div className="lg:col-span-1 space-y-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('healthTracker.insightPanelTitle')}</h2>
          <button
            onClick={handleAnalyze}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400"
            disabled={isLoading}
          >
            {isLoading ? <Icon name="loader" className="w-5 h-5 animate-spin" /> : <Icon name="sparkles" className="w-5 h-5" />}
            {t('healthTracker.analyzeButton')}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {analysis && !isLoading && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <p className="whitespace-pre-wrap">{analysis}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('healthTracker.trendTitle')}</h2>
            {formattedChartData.length > 0 ? (
                <HealthChart data={formattedChartData} />
            ) : (
                <div className="text-center text-slate-500 py-8">
                    <p>{t('healthTracker.noData')}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HealthTracker;