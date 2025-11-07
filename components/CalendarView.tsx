import React, { useState, useContext } from 'react';
import { HealthLog } from '../types';
import { getHealthLogSummary } from '../services/geminiService';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';
import { SettingsContext } from '../contexts/SettingsContext';


interface CalendarViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  healthLogs: Record<string, HealthLog>;
  onLogsUpdate: (logs: Record<string, HealthLog>) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, setCurrentDate, healthLogs, onLogsUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { language } = useContext(SettingsContext);
  
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);

  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  const closeLogModal = () => {
      setSelectedDate(null);
  }

  const dayNames = [...Array(7).keys()].map(i => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return d.toLocaleDateString(language, { weekday: 'short' });
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 transition"><Icon name="chevron-left" className="w-6 h-6"/></button>
        <h3 className="text-lg font-semibold">{currentDate.toLocaleString(language, { month: 'long', year: 'numeric' })}</h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 transition"><Icon name="chevron-right" className="w-6 h-6"/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-500">
        {dayNames.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {days.map((date, index) => {
          const dateString = date.toISOString().split('T')[0];
          const log = healthLogs[dateString];
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = new Date().toISOString().split('T')[0] === dateString;

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`relative h-24 p-2 border rounded-lg cursor-pointer transition ${
                isCurrentMonth ? 'bg-white hover:bg-primary-light' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              } ${isToday ? 'border-2 border-primary' : 'border-slate-200'}`}
              style={{
                borderColor: isToday ? 'var(--primary-color)' : '',
              }}
            >
              <span className={`font-medium ${isToday ? 'text-primary' : ''}`} style={{color: isToday ? 'var(--primary-color)' : ''}}>{date.getDate()}</span>
              {log && (
                <div className="absolute bottom-2 left-2 right-2 text-xs text-left p-1 bg-primary-light text-primary-dark rounded truncate">
                  {log.summary}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedDate && <HealthLogModal date={selectedDate} healthLogs={healthLogs} onLogsUpdate={onLogsUpdate} onClose={closeLogModal}/>}
    </div>
  );
};

interface HealthLogModalProps {
    date: Date;
    healthLogs: Record<string, HealthLog>;
    onLogsUpdate: (logs: Record<string, HealthLog>) => void;
    onClose: () => void;
}

const HealthLogModal: React.FC<HealthLogModalProps> = ({ date, healthLogs, onLogsUpdate, onClose }) => {
    const dateString = date.toISOString().split('T')[0];
    const existingLog = healthLogs[dateString];
    const [logText, setLogText] = useState(existingLog?.log || '');
    const [severity, setSeverity] = useState(existingLog?.symptomSeverity || 5);
    const [isSaving, setIsSaving] = useState(false);
    const { t } = useTranslations();
    const { language } = useContext(SettingsContext);

    const handleSave = async () => {
        if (!logText.trim()) return;
        setIsSaving(true);
        try {
            const summary = await getHealthLogSummary(logText, language);
            const newLog: HealthLog = {
                id: existingLog?.id || new Date().toISOString(),
                date: dateString,
                log: logText,
                summary,
                symptomSeverity: severity
            };
            onLogsUpdate({ ...healthLogs, [dateString]: newLog });
            onClose();
        } catch (error) {
            console.error(t('calendar.error'), error);
            // Optionally, show an error to the user
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = () => {
        const newLogs = { ...healthLogs };
        delete newLogs[dateString];
        onLogsUpdate(newLogs);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md m-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{t('calendar.logModalTitle', {date: date.toLocaleDateString(language)})}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200"><Icon name="close" className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                    <textarea 
                        value={logText}
                        onChange={(e) => setLogText(e.target.value)}
                        placeholder={t('calendar.logPlaceholder')}
                        className="w-full h-32 p-3 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t('calendar.severityLabel')}</label>
                        <div className="flex items-center gap-4">
                            <input type="range" min="1" max="10" value={severity} onChange={e => setSeverity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer range-thumb-primary"/>
                            <span className="font-bold w-8 text-center" style={{color: 'var(--primary-color)'}}>{severity}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                       {existingLog && (
                         <button onClick={handleDelete} className="text-red-600 hover:text-red-800 font-medium transition">{t('calendar.deleteButton')}</button>
                       )}
                       <div className="flex-grow"></div>
                       <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">{t('calendar.cancelButton')}</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:bg-slate-400 flex items-center gap-2" style={{backgroundColor: 'var(--primary-color)'}}>
                           {isSaving ? <><Icon name="loader" className="w-5 h-5 animate-spin"/> {t('calendar.savingButton')}</> : t('calendar.saveButton')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CalendarView;