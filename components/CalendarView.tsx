
import React, { useState } from 'react';
import { HealthLog } from '../types';
import { getHealthLogSummary } from '../services/geminiService';
import { Icon } from './common/Icon';

interface CalendarViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  healthLogs: Record<string, HealthLog>;
  onLogsUpdate: (logs: Record<string, HealthLog>) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, setCurrentDate, healthLogs, onLogsUpdate }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100 transition"><Icon name="chevron-left" className="w-6 h-6"/></button>
        <h3 className="text-lg font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100 transition"><Icon name="chevron-right" className="w-6 h-6"/></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-slate-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
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
                isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              } ${isToday ? 'border-2 border-blue-500' : 'border-slate-200'}`}
            >
              <span className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>{date.getDate()}</span>
              {log && (
                <div className="absolute bottom-2 left-2 right-2 text-xs text-left p-1 bg-blue-100 text-blue-800 rounded truncate">
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

    const handleSave = async () => {
        if (!logText.trim()) return;
        setIsSaving(true);
        try {
            const summary = await getHealthLogSummary(logText);
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
            console.error("Failed to save health log:", error);
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
                    <h3 className="text-lg font-semibold">Health Log for {date.toLocaleDateString()}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200"><Icon name="close" className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                    <textarea 
                        value={logText}
                        onChange={(e) => setLogText(e.target.value)}
                        placeholder="How are you feeling today?"
                        className="w-full h-32 p-3 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Symptom Severity (1: Mild - 10: Severe)</label>
                        <div className="flex items-center gap-4">
                            <input type="range" min="1" max="10" value={severity} onChange={e => setSeverity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                            <span className="font-bold text-blue-600 w-8 text-center">{severity}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                       {existingLog && (
                         <button onClick={handleDelete} className="text-red-600 hover:text-red-800 font-medium transition">Delete Log</button>
                       )}
                       <div className="flex-grow"></div>
                       <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center gap-2">
                           {isSaving ? <><Icon name="loader" className="w-5 h-5 animate-spin"/> Saving...</> : 'Save Log'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CalendarView;
