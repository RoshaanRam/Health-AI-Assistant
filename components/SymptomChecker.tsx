import React, { useState, useEffect, useRef, useContext } from 'react';
import { getDiagnosis } from '../services/geminiService';
import { Diagnosis, GeolocationData, Demographics, PossibleCause, LocalHealthcareOption } from '../types';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';
import { SettingsContext } from '../contexts/SettingsContext';

const SymptomChecker: React.FC = () => {
    const { t } = useTranslations();
    const { language } = useContext(SettingsContext);
    const [symptoms, setSymptoms] = useState('');
    const [demographics, setDemographics] = useState<Demographics>({ age: null, gender: '', ethnicity: '' });
    const [location, setLocation] = useState<GeolocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

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
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symptoms.trim()) return;

        setIsLoading(true);
        setError(null);
        setDiagnosis(null);

        try {
            const result = await getDiagnosis(symptoms, location, demographics, language);
            setDiagnosis(result);
        } catch (err: any) {
            setError(err.message || t('symptomChecker.error.fetch'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemographicsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDemographics(prev => ({
            ...prev,
            [name]: name === 'age' ? (value === '' ? null : Number(value)) : value
        }));
    };
    
    const ethnicityOptions = t('symptomChecker.ethnicities', {}) ? Object.keys(t('symptomChecker.ethnicities', {})).map(key => ({
        key,
        value: t(`symptomChecker.ethnicities.${key}`)
    })) : [];

    return (
        <div className="space-y-8">
            <form onSubmit={handleSubmit} className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm space-y-6">
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
                        <label htmlFor="gender" className="block text-sm font-medium text-slate-700">{t('symptomChecker.gender')}</label>
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
                         <select id="ethnicity" name="ethnicity" value={demographics.ethnicity} onChange={handleDemographicsChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                            <option value="">{t('symptomChecker.select')}</option>
                            {ethnicityOptions.map(option => <option key={option.key} value={option.value}>{option.value}</option>)}
                            <option value="Other">{t('symptomChecker.other')}</option>
                            <option value="Prefer not to say">{t('symptomChecker.preferNotToSay')}</option>
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
                                <span>{t('symptomChecker.submitButton.loading')}</span>
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

            {error && <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">{error}</div>}

            {diagnosis && (
                <div className="space-y-8">
                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('symptomChecker.results.possibleCauses')}</h2>
                        <ul className="space-y-4">
                            {diagnosis.possible_causes.map((item: PossibleCause, index: number) => (
                                <li key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold text-primary">{item.cause}</h3>
                                        <span className="text-sm font-medium text-slate-600 bg-primary-light px-2 py-1 rounded-full">{item.confidence}{t('symptomChecker.results.confidence')}</span>
                                    </div>
                                    <p className="mt-2 text-slate-700"><span className="font-semibold">{t('symptomChecker.results.suggestedTreatment')}</span> {item.suggested_treatment}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-themed-sm">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('symptomChecker.results.localHealthcare')}</h2>
                        <ul className="space-y-3">
                             {diagnosis.local_healthcare_options.map((item: LocalHealthcareOption, index: number) => (
                                <li key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                    <h3 className="text-lg font-semibold text-slate-800">{item.name} <span className="text-sm font-normal text-slate-500">({item.type})</span></h3>
                                    <p className="mt-1 text-slate-600 flex items-center gap-2">
                                        <Icon name="location" className="w-4 h-4 text-slate-400" />
                                        <span>{item.address}</span>
                                    </p>
                                    {item.opening_hours && (
                                        <p className="mt-1 text-slate-600 flex items-center gap-2">
                                            <Icon name="clock" className="w-4 h-4 text-slate-400" />
                                            <span>{item.opening_hours}</span>
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SymptomChecker;