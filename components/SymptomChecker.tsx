

import React, { useState, useEffect, useRef, useContext } from 'react';
import { getDiagnosis, getFollowUpQuestions } from '../services/geminiService';
import { Diagnosis, GeolocationData, Demographics, PossibleCause, LocalHealthcareOption, HealthLog } from '../types';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';
import { SettingsContext } from '../contexts/SettingsContext';

const SymptomChecker: React.FC = () => {
    const { t } = useTranslations();
    const { language } = useContext(SettingsContext);
    const [symptoms, setSymptoms] = useState('');
    const [demographics, setDemographics] = useState<Demographics>({ age: null, gender: '', ethnicity: '' });
    const [location, setLocation] = useState<GeolocationData | null>(null);
    
    // UI States
    const [stage, setStage] = useState<'input' | 'questions' | 'results'>('input');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Data States
    const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
    const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
    
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [selectedCause, setSelectedCause] = useState<PossibleCause | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    const commonTags = [
        'fever', 'cough', 'headache', 'fatigue', 'nausea', 'dizziness', 
        'soreThroat', 'shortnessOfBreath', 'chestPain', 'rash'
    ];

    // Ethnicity Groups Structure
    const ethnicityGroups = [
        {
            category: 'white',
            options: ['white_caucasian', 'white_other']
        },
        {
            category: 'black',
            options: ['black_african', 'black_caribbean', 'black_american', 'black_other']
        },
        {
            category: 'asian',
            options: ['asian_chinese', 'asian_indian', 'asian_filipino', 'asian_japanese', 'asian_korean', 'asian_vietnamese', 'asian_south', 'asian_southeast']
        },
        {
            category: 'hispanic',
            options: ['hispanic_latino']
        },
        {
            category: 'middleEastern',
            options: ['middle_eastern_arab', 'middle_eastern_other']
        },
        {
            category: 'mixed',
            options: ['mixed_white_black', 'mixed_white_asian', 'mixed_other']
        },
        {
            category: 'indigenous',
            options: ['indigenous_native', 'indigenous_pacific']
        },
        {
            category: 'other',
            options: ['other_other', 'prefer_not_to_say']
        }
    ];

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                setError(t('symptomChecker.error.location'));
            }
        );

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = language;

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                setSymptoms(prev => prev + finalTranscript);
            };

            recognitionRef.current.onerror = (event: any) => {
                setError(t('symptomChecker.mic.error', {error: event.error}));
                setIsRecording(false);
            };

             recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, [language, t]);

    // Stop speaking when unmounting
    useEffect(() => {
      return () => {
        window.speechSynthesis.cancel();
      };
    }, []);

    const handleMicClick = () => {
        if (!recognitionRef.current) {
            setError(t('symptomChecker.mic.notSupported'));
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };
    
    // Step 1: User submits symptoms -> Get Follow-up Questions
    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symptoms.trim()) return;

        setIsLoading(true);
        setError(null);
        setFollowUpAnswers({});
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSaveStatus('idle');

        try {
            // Get follow up questions first
            const questions = await getFollowUpQuestions(symptoms, language);
            if (questions && questions.length > 0) {
                setFollowUpQuestions(questions);
                setStage('questions');
            } else {
                // If no questions generated (or error), go straight to diagnosis
                await fetchDiagnosis({}); 
            }
        } catch (err: any) {
            // Fallback to direct diagnosis on error
            await fetchDiagnosis({});
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Handle Question Answers
    const handleQuestionAnswer = (question: string, answer: string) => {
        setFollowUpAnswers(prev => ({
            ...prev,
            [question]: answer
        }));
    };

    const handleSkipQuestions = async () => {
        setStage('results'); // Show loading state on results page or keep spinner
        await fetchDiagnosis({});
    };

    const handleSubmitAnswers = async () => {
        await fetchDiagnosis(followUpAnswers);
    };

    // Step 3: Get Final Diagnosis
    const fetchDiagnosis = async (answers: Record<string, string>) => {
        setStage('results');
        setIsLoading(true);
        try {
            const result = await getDiagnosis(symptoms, answers, location, demographics, language);
            setDiagnosis(result);
        } catch (err: any) {
            setError(err.message || t('symptomChecker.error.fetch'));
            setStage('input'); // Reset to input on hard error
        } finally {
            setIsLoading(false);
        }
    }

    const handleDemographicsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDemographics(prev => ({
            ...prev,
            [name]: name === 'age' ? (value === '' ? null : Number(value)) : value
        }));
    };
    
    const handleReadAloud = () => {
      if (!diagnosis) return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const textToRead = [
        t('symptomChecker.results.possibleCauses'),
        ...diagnosis.possible_causes.map(c => `${c.cause}. ${c.suggested_treatment}`),
        t('symptomChecker.results.homeCare'),
        ...(diagnosis.home_care_tips || []),
      ].join('. ');

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = language;
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    };
    
    const handleHealthcareClick = (item: LocalHealthcareOption) => {
        const query = encodeURIComponent(`${item.name} ${item.address}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    const handleAddTag = (tagKey: string) => {
        const tagLabel = t(`symptomChecker.tags.${tagKey}`);
        setSymptoms(prev => {
            if (!prev.trim()) return tagLabel;
            if (prev.includes(tagLabel)) return prev; // Avoid duplicates
            return `${prev}, ${tagLabel}`;
        });
    };

    const handleSaveToTracker = () => {
        if (!diagnosis || !symptoms) return;
        
        const topDiagnosis = diagnosis.possible_causes[0]?.cause || 'Unknown';
        const dateString = new Date().toISOString().split('T')[0];
        
        const newLog: HealthLog = {
            id: Date.now().toString(), // Unique ID
            date: dateString,
            log: `${symptoms}. Diagnosis: ${topDiagnosis}`,
            summary: `Check: ${topDiagnosis}`,
            symptomSeverity: 5, // Default severity
        };

        try {
            const storedLogs = localStorage.getItem('healthLogs');
            const existingLogs: HealthLog[] = storedLogs ? JSON.parse(storedLogs) : [];
            const updatedLogs = [...existingLogs, newLog];
            localStorage.setItem('healthLogs', JSON.stringify(updatedLogs));
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000); // Reset after 3 seconds
        } catch (e) {
            console.error("Failed to save to tracker", e);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <div className="space-y-8">
            {/* Emergency Disclaimer Banner */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm animate-pulse">
                <div className="flex items-start gap-3">
                    <Icon name="info" className="w-6 h-6 text-red-500 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-bold uppercase tracking-wide text-sm">Medical Disclaimer</h3>
                        <p className="text-red-700 font-medium text-sm md:text-base mt-1">
                            {t('symptomChecker.emergencyWarning')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Input Form - Hidden if in results mode but shown in input mode */}
            {stage === 'input' && (
                <form onSubmit={handleInitialSubmit} className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-slate-700">{t('symptomChecker.age')}</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={demographics.age === null ? '' : demographics.age}
                                onChange={handleDemographicsChange}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder={t('symptomChecker.agePlaceholder')}
                            />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-slate-700">{t('symptomChecker.sexAtBirth')}</label>
                            <select id="gender" name="gender" value={demographics.gender} onChange={handleDemographicsChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                <option value="">{t('symptomChecker.select')}</option>
                                <option value="Male">{t('symptomChecker.male')}</option>
                                <option value="Female">{t('symptomChecker.female')}</option>
                                <option value="Other">{t('symptomChecker.other')}</option>
                                <option value="Prefer not to say">{t('symptomChecker.preferNotToSay')}</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="ethnicity" className="block text-sm font-medium text-slate-700">{t('symptomChecker.ethnicity')}</label>
                            <select 
                                id="ethnicity" 
                                name="ethnicity" 
                                value={demographics.ethnicity} 
                                onChange={handleDemographicsChange} 
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            >
                                <option value="">{t('symptomChecker.select')}</option>
                                {ethnicityGroups.map(group => (
                                    <optgroup key={group.category} label={t(`symptomChecker.ethnicityCategories.${group.category}`)}>
                                        {group.options.map(optionKey => (
                                            <option key={optionKey} value={t(`symptomChecker.ethnicityOptions.${optionKey}`)}>
                                                {t(`symptomChecker.ethnicityOptions.${optionKey}`)}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700">{t('symptomChecker.describeSymptoms')}</label>
                        <div className="mt-1 relative">
                            <textarea
                                id="symptoms"
                                rows={5}
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                className="block w-full px-3 py-2 pr-12 bg-white border border-slate-300 rounded-md shadow-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder={t('symptomChecker.symptomsPlaceholder')}
                                required
                            />
                            {recognitionRef.current && (
                                <button
                                    type="button"
                                    onClick={handleMicClick}
                                    className={`absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-slate-500 hover:text-primary transition-colors ${isRecording ? 'text-red-500' : ''}`}
                                    title={isRecording ? t('symptomChecker.mic.stop') : t('symptomChecker.mic.start')}
                                >
                                    <Icon name="microphone" className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                        {/* Quick Tags */}
                        <div className="mt-3">
                            <span className="text-xs font-medium text-slate-500 block mb-2">{t('symptomChecker.commonTagsLabel')}</span>
                            <div className="flex flex-wrap gap-2">
                                {commonTags.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAddTag(tag)}
                                        className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                                    >
                                        {t(`symptomChecker.tags.${tag}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={isLoading || !symptoms.trim()}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Icon name="loader" className="w-5 h-5 animate-spin" />
                                    <span>{t('symptomChecker.submitButton.generatingQuestions')}</span>
                                </>
                            ) : (
                                <>
                                    <Icon name="sparkles" className="w-5 h-5" />
                                    <span>{t('symptomChecker.submitButton.default')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {error && <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">{error}</div>}

            {/* Follow-up Questions Modal */}
            {stage === 'questions' && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in min-h-screen">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-scale-in m-auto">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{t('symptomChecker.followUp.title')}</h3>
                        <p className="text-slate-600 mb-6">{t('symptomChecker.followUp.subtitle')}</p>
                        
                        <div className="space-y-4">
                            {followUpQuestions.map((q, idx) => (
                                <div key={idx}>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{q}</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                                        placeholder="Type your answer..."
                                        onChange={(e) => handleQuestionAnswer(q, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button 
                                onClick={handleSkipQuestions}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                            >
                                {t('symptomChecker.followUp.skip')}
                            </button>
                            <button 
                                onClick={handleSubmitAnswers}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-medium shadow-sm"
                            >
                                {t('symptomChecker.followUp.submit')}
                            </button>
                        </div>
                    </div>
                 </div>
            )}
            
            {/* Loading Overlay for Final Analysis */}
            {stage === 'results' && isLoading && (
                 <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                    <Icon name="loader" className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-lg font-medium text-slate-600">{t('symptomChecker.submitButton.loading')}</p>
                 </div>
            )}

            {stage === 'results' && !isLoading && diagnosis && (
                <div className="space-y-8 animate-fade-in-up diagnosis-result">
                    
                    <button 
                        onClick={() => { setStage('input'); setSymptoms(''); setDiagnosis(null); }}
                        className="mb-4 text-sm text-primary hover:underline flex items-center gap-1 no-print"
                    >
                        <Icon name="chevron-left" className="w-4 h-4"/> Back to Checker
                    </button>

                    <div className="flex flex-col sm:flex-row justify-end gap-2 no-print">
                       {/* Save to Tracker Button */}
                       <button
                         onClick={handleSaveToTracker}
                         disabled={saveStatus === 'saved'}
                         className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${saveStatus === 'saved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                       >
                            {saveStatus === 'saved' ? (
                                <>
                                    <Icon name="sparkles" className="w-4 h-4" /> 
                                    {t('symptomChecker.results.savedSuccess')}
                                </>
                            ) : (
                                <>
                                    <Icon name="calendar" className="w-4 h-4" />
                                    {t('symptomChecker.results.saveToTracker')}
                                </>
                            )}
                       </button>

                       {/* Print Button */}
                       <button
                         onClick={handlePrint}
                         className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                         </svg>
                         {t('symptomChecker.results.printReport')}
                       </button>

                       <button
                         onClick={handleReadAloud}
                         className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isSpeaking ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-primary-light text-primary-dark hover:bg-blue-100'}`}
                       >
                         {isSpeaking ? (
                           <>
                             <span className="animate-pulse">●</span>
                             {t('symptomChecker.results.stopReading')}
                           </>
                         ) : (
                           <>
                             <Icon name="microphone" className="w-4 h-4" />
                             {t('symptomChecker.results.readAloud')}
                           </>
                         )}
                       </button>
                    </div>

                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm print-full-width">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('symptomChecker.results.possibleCauses')}</h2>
                        <ul className="space-y-4">
                            {diagnosis.possible_causes.map((item: PossibleCause, index: number) => (
                                <li 
                                    key={index} 
                                    onClick={() => setSelectedCause(item)}
                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:shadow-md transition-all hover:bg-slate-100 group break-inside-avoid"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold text-primary group-hover:text-primary-dark transition-colors">{item.cause}</h3>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getConfidenceColor(item.confidence)}`}>
                                            {item.confidence}{t('symptomChecker.results.confidence')}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-slate-700"><span className="font-semibold">{t('symptomChecker.results.suggestedTreatment')}</span> {item.suggested_treatment}</p>
                                    <div className="mt-3 text-xs text-primary font-medium flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity no-print">
                                        <Icon name="info" className="w-4 h-4"/>
                                        {t('symptomChecker.results.tapForDetails')}
                                    </div>
                                    {/* Print only details */}
                                    <div className="hidden print-only-visible mt-2 border-t pt-2">
                                        <p className="text-sm text-slate-600"><strong>{t('symptomChecker.results.causeDetails.description')}:</strong> {item.description}</p>
                                        {item.when_to_seek_medical_attention && (
                                             <p className="text-sm text-red-700 mt-1"><strong>{t('symptomChecker.results.causeDetails.whenToSeeDoctor')}:</strong> {item.when_to_seek_medical_attention}</p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {diagnosis.home_care_tips && diagnosis.home_care_tips.length > 0 && (
                        <div className="p-6 bg-teal-50/90 backdrop-blur-sm rounded-xl shadow-themed-sm border border-teal-100 print-full-width">
                             <div className="flex items-center gap-2 mb-4">
                                <Icon name="sparkles" className="w-6 h-6 text-teal-600" />
                                <h2 className="text-2xl font-bold text-teal-900">{t('symptomChecker.results.homeCare')}</h2>
                             </div>
                             <ul className="space-y-3">
                                {diagnosis.home_care_tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-3 text-teal-800">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center font-bold text-sm">{index + 1}</span>
                                        <span className="mt-0.5">{tip}</span>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}

                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm print-full-width">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('symptomChecker.results.localHealthcare')}</h2>
                        <ul className="space-y-3">
                             {diagnosis.local_healthcare_options.map((item: LocalHealthcareOption, index: number) => (
                                <li 
                                    key={index} 
                                    onClick={() => handleHealthcareClick(item)}
                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:shadow-md transition-all hover:bg-slate-100 group break-inside-avoid"
                                >
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-primary transition-colors">{item.name} <span className="text-sm font-normal text-slate-500">({item.type})</span></h3>
                                        <Icon name="location" className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="mt-1 text-slate-600 text-sm flex items-center gap-2">
                                        <span>{item.address}</span>
                                    </p>
                                    {item.opening_hours && (
                                        <p className="mt-1 text-slate-600 flex items-center gap-2 text-sm">
                                            <Icon name="clock" className="w-4 h-4 text-slate-400" />
                                            <span>{item.opening_hours}</span>
                                        </p>
                                    )}
                                    {item.wait_time && (
                                        <p className="mt-1 text-slate-600 flex items-center gap-2 text-sm">
                                            <Icon name="clock" className="w-4 h-4 text-amber-500" />
                                            <span className="text-amber-700 font-medium">{t('symptomChecker.results.waitTime')}: {item.wait_time}</span>
                                        </p>
                                    )}
                                    <div className="mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 no-print">
                                        {t('symptomChecker.results.viewOnMap')}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Modal for Detailed Cause Information */}
            {selectedCause && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print" onClick={() => setSelectedCause(null)}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
                            <h3 className="text-xl font-bold text-slate-800 pr-4">{selectedCause.cause}</h3>
                            <button 
                                onClick={() => setSelectedCause(null)} 
                                className="p-2 -mr-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Icon name="close" className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">{t('symptomChecker.results.causeDetails.description')}</h4>
                                <p className="text-slate-700 leading-relaxed">{selectedCause.description || "No detailed description available."}</p>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide mb-2">{t('symptomChecker.results.suggestedTreatment')}</h4>
                                <p className="text-blue-900 leading-relaxed">{selectedCause.suggested_treatment}</p>
                            </div>

                            {selectedCause.when_to_seek_medical_attention && (
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Icon name="info" className="w-4 h-4 text-amber-600" />
                                        <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide">{t('symptomChecker.results.causeDetails.whenToSeeDoctor')}</h4>
                                    </div>
                                    <p className="text-amber-900 leading-relaxed">{selectedCause.when_to_seek_medical_attention}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SymptomChecker;