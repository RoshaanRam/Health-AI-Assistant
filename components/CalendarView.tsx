import React, { useState, useContext } from 'react';
import { HealthLog } from '../types';
import { getHealthLogSummary } from '../services/geminiService';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';
import { SettingsContext } from '../contexts/SettingsContext';

interface CalendarViewProps {
  logs: HealthLog[];
  onLogsChange: (logs: HealthLog[]) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs, onLogsChange }) => {
    const { t } = useTranslations();
    const { language } = useContext(SettingsContext);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentLog, setCurrentLog] = useState('');
    const [symptomSeverity, setSymptomSeverity] = useState(5);
    const [isSaving, setIsSaving] = useState(false);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const openModal = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        const existingLog = logs.find(log => log.date === dateString);
        setSelectedDate(date);
        setCurrentLog(existingLog?.log || '');
        setSymptomSeverity(existingLog?.symptomSeverity || 5);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        setCurrentLog('');
        setSymptomSeverity(5);
    };

    const handleSave = async () => {
        if (!selectedDate || !currentLog.trim()) return;
        setIsSaving(true);
        const dateString = selectedDate.toISOString().split('T')[0];
        
        try {
            const summary = await getHealthLogSummary(currentLog, language);
            const newLog: HealthLog = {
                id: dateString,
                date: dateString,
                log: currentLog,
                summary: summary,
                symptomSeverity: symptomSeverity,
            };

            const newLogs = logs.filter(log => log.date !== dateString);
            onLogsChange([...newLogs, newLog]);
            closeModal();
        } catch (error) {
            console.error(t('calendar.error'), error);
             // Save with fallback summary if API fails
            const fallbackLog: HealthLog = {
                id: dateString,
                date: dateString,
                log: currentLog,
                summary: t('calendar.fallbackSummary'),
                symptomSeverity: symptomSeverity,
            };
            const newLogs = logs.filter(log => log.date !== dateString);
            onLogsChange([...newLogs, fallbackLog]);
            closeModal();
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        if (!selectedDate) return;
        const dateString = selectedDate.toISOString().split('T')[0];
        const newLogs = logs.filter(log => log.date !== dateString);
        onLogsChange(newLogs);
        closeModal();
    };

    const renderDays = () => {
        const days = [];
        let day = new Date(startDate);
        while (day <= endDate) {
            const dateString = day.toISOString().split('T')[0];
            const logForDay = logs.find(log => log.date === dateString);
            const isToday = new Date().toISOString().split('T')[0] === dateString;
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();

            days.push(
                <div 
                    key={day.toISOString()} 
                    className={`p-2 border border-slate-200/50 rounded-md cursor-pointer transition-colors duration-200 flex flex-col justify-between h-24 ${isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'} hover:bg-primary-light`}
                    onClick={() => openModal(new Date(day))}
                >
                    <span className={`text-sm ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center font-bold' : 'text-slate-700'}`}>
                        {day.getDate()}
                    </span>
                    {logForDay && <p className="text-xs text-slate-600 truncate">{logForDay.summary}</p>}
                </div>
            );
            day.setDate(day.getDate() + 1);
        }
        return days;
    };
    
    const weekDays = [...Array(7).keys()].map(i => new Date(2023, 0, i + 1).toLocaleDateString(language, { weekday: 'short' }));

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-slate-100"><Icon name="chevron-left" /></button>
                <h3 className="text-lg font-semibold text-slate-800">{currentDate.toLocaleDateString(language, { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-slate-100"><Icon name="chevron-right" /></button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-500 mb-2">
                {weekDays.map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {renderDays()}
            </div>

            {isModalOpen && selectedDate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="text-xl font-bold text-slate-800">{t('calendar.logModalTitle', { date: selectedDate.toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) })}</h4>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><Icon name="close" /></button>
                        </div>
                        <div className="space-y-4">
                            <textarea
                                value={currentLog}
                                onChange={(e) => setCurrentLog(e.target.value)}
                                rows={5}
                                placeholder={t('calendar.logPlaceholder')}
                                className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                            />
                            <div>
                                <label htmlFor="severity" className="block text-sm font-medium text-slate-700 mb-2">{t('calendar.severityLabel')}</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">1</span>
                                    <input
                                        id="severity"
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={symptomSeverity}
                                        onChange={(e) => setSymptomSeverity(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer range-thumb"
                                    />
                                    <span className="text-sm">10</span>
                                    <span className="font-bold w-6 text-center">{symptomSeverity}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                            <button onClick={handleDelete} className="text-sm font-medium text-red-600 hover:text-red-800">{t('calendar.deleteButton')}</button>
                            <div className="flex gap-2">
                                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">{t('calendar.cancelButton')}</button>
                                <button onClick={handleSave} disabled={isSaving || !currentLog.trim()} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark disabled:bg-slate-400">
                                    {isSaving ? t('calendar.savingButton') : t('calendar.saveButton')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarView;
