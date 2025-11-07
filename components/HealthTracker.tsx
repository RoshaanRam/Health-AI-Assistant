import React, { useState, useEffect, useCallback, useContext } from 'react';
import CalendarView from './CalendarView';
import HealthChart from './HealthChart';
import { HealthLog } from '../types';
import { getHealthAnalysis } from '../services/geminiService';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';
import { SettingsContext } from '../contexts/SettingsContext';

const HealthTracker: React.FC = () => {
    const { t } = useTranslations();
    const { language } = useContext(SettingsContext);
    const [logs, setLogs] = useState<HealthLog[]>([]);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedLogs = localStorage.getItem('healthLogs');
            if (storedLogs) {
                setLogs(JSON.parse(storedLogs));
            }
        } catch (e) {
            console.error("Failed to load health logs from localStorage", e);
        }
    }, []);

    const updateLogs = useCallback((newLogs: HealthLog[]) => {
        setLogs(newLogs);
        try {
            localStorage.setItem('healthLogs', JSON.stringify(newLogs));
        } catch (e) {
            console.error("Failed to save health logs to localStorage", e);
        }
    }, []);

    const handleAnalyze = async () => {
        if (logs.length === 0) {
            setError(t('healthTracker.error.noLogs'));
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await getHealthAnalysis(logs, language);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || t('healthTracker.error.fetch'));
        } finally {
            setIsLoading(false);
        }
    };

    const chartData = logs
        .map(log => ({
            date: new Date(log.date).toLocaleDateString(language, { month: 'short', day: 'numeric' }),
            severity: log.symptomSeverity,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('healthTracker.calendarTitle')}</h2>
                    <CalendarView logs={logs} onLogsChange={updateLogs} />
                </div>
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('healthTracker.trendTitle')}</h2>
                    {chartData.length > 0 ? (
                        <HealthChart data={chartData} />
                    ) : (
                        <p className="text-slate-500 text-center py-8">{t('healthTracker.noData')}</p>
                    )}
                </div>
            </div>
            
            <div className="lg:col-span-1 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm sticky top-24">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('healthTracker.insightPanelTitle')}</h2>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || logs.length === 0}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? (
                        <Icon name="loader" className="w-5 h-5 animate-spin" />
                    ) : (
                        <Icon name="sparkles" className="w-5 h-5" />
                    )}
                    <span>{t('healthTracker.analyzeButton')}</span>
                </button>

                {error && <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md text-sm">{error}</div>}
                
                <div className="mt-4 space-y-2 text-slate-700">
                    {analysis && <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />}
                </div>
            </div>
        </div>
    );
};

export default HealthTracker;
