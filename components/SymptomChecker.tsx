// FIX: Add type declarations for the Web Speech API to resolve TypeScript errors.
// The SpeechRecognition API is not part of standard DOM typings.
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly length: number;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { Diagnosis, GeolocationData, Demographics } from '../types';
import { getDiagnosis } from '../services/geminiService';
import { Icon } from './common/Icon';
import { useTranslations } from '../hooks/useTranslations';
import { SettingsContext } from '../contexts/SettingsContext';

const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [ethnicity, setEthnicity] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [geolocation, setGeolocation] = useState<GeolocationData | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { language } = useContext(SettingsContext);
  const { t } = useTranslations();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        setError(t('symptomChecker.error.location'));
      }
    );
  }, [t]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported by this browser.");
      setSpeechSupported(false);
      return;
    }
    setSpeechSupported(true);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let newTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newTranscript += event.results[i][0].transcript;
        }
      }
      if (newTranscript) {
        setSymptoms(prevSymptoms => (prevSymptoms ? prevSymptoms.trim() + ' ' : '') + newTranscript.trim());
      }
    };

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => {
      console.error('Speech Recognition Error', event.error);
      setError(t('symptomChecker.mic.error', {error: event.error}));
      setIsRecording(false);
    };

    return () => {
      recognition.stop();
    };
  }, [setError, language, t]);

  const handleMicClick = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!symptoms.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    const demographics: Demographics = {
        age: age ? parseInt(age, 10) : null,
        gender,
        ethnicity,
    };

    try {
      const result = await getDiagnosis(symptoms, geolocation, demographics, language);
      setDiagnosis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('symptomChecker.error.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [symptoms, geolocation, isLoading, age, gender, ethnicity, language, t]);

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('symptomChecker.patientInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-600 mb-1">{t('symptomChecker.age')}</label>
                <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    disabled={isLoading}
                    min="0"
                    placeholder={t('symptomChecker.agePlaceholder')}
                />
            </div>
            <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-1">{t('symptomChecker.gender')}</label>
                <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    disabled={isLoading}
                >
                    <option value="">{t('symptomChecker.select')}</option>
                    <option value="Male">{t('symptomChecker.male')}</option>
                    <option value="Female">{t('symptomChecker.female')}</option>
                    <option value="Other">{t('symptomChecker.other')}</option>
                    <option value="Prefer not to say">{t('symptomChecker.preferNotToSay')}</option>
                </select>
            </div>
            <div>
                <label htmlFor="ethnicity" className="block text-sm font-medium text-slate-600 mb-1">{t('symptomChecker.ethnicity')}</label>
                <select
                    id="ethnicity"
                    value={ethnicity}
                    onChange={(e) => setEthnicity(e.target.value)}
                    className="w-full p-2 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    disabled={isLoading}
                >
                    <option value="">{t('symptomChecker.select')}</option>
                    <option value="White">{t('symptomChecker.ethnicities.white')}</option>
                    <option value="South Asian">{t('symptomChecker.ethnicities.southAsian')}</option>
                    <option value="Chinese">{t('symptomChecker.ethnicities.chinese')}</option>
                    <option value="Black">{t('symptomChecker.ethnicities.black')}</option>
                    <option value="Filipino">{t('symptomChecker.ethnicities.filipino')}</option>
                    <option value="Latin American">{t('symptomChecker.ethnicities.latinAmerican')}</option>
                    <option value="Arab">{t('symptomChecker.ethnicities.arab')}</option>
                    <option value="Southeast Asian">{t('symptomChecker.ethnicities.southeastAsian')}</option>
                    <option value="West Asian">{t('symptomChecker.ethnicities.westAsian')}</option>
                    <option value="Korean">{t('symptomChecker.ethnicities.korean')}</option>
                    <option value="Japanese">{t('symptomChecker.ethnicities.japanese')}</option>
                    <option value="Indigenous">{t('symptomChecker.ethnicities.indigenous')}</option>
                    <option value="Other">{t('symptomChecker.other')}</option>
                    <option value="Prefer not to say">{t('symptomChecker.preferNotToSay')}</option>
                </select>
            </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">{t('symptomChecker.describeSymptoms')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={t('symptomChecker.symptomsPlaceholder')}
              className="w-full h-32 p-4 pr-16 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleMicClick}
              style={{ backgroundColor: isRecording ? '#ef4444' : 'var(--primary-color)' }}
              className={`absolute top-3 right-3 p-2 rounded-full text-white transition-colors duration-200 ${
                isRecording ? 'animate-pulse' : 'hover:opacity-90'
              } disabled:bg-slate-400 disabled:cursor-not-allowed`}
              disabled={isLoading || !speechSupported}
              aria-label={isRecording ? t('symptomChecker.mic.stop') : t('symptomChecker.mic.start')}
              title={!speechSupported ? t('symptomChecker.mic.notSupported') : (isRecording ? t('symptomChecker.mic.stop') : t('symptomChecker.mic.start'))}
            >
              <Icon name="microphone" className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed transition"
            disabled={isLoading || !symptoms.trim()}
          >
            {isLoading ? (
              <>
                <Icon name="loader" className="w-5 h-5 animate-spin" />
                {t('symptomChecker.submitButton.loading')}
              </>
            ) : (
              <>
                <Icon name="sparkles" className="w-5 h-5" />
                {t('symptomChecker.submitButton.default')}
              </>
            )}
          </button>
        </form>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}
      
      {isLoading && <LoadingSkeleton />}

      {diagnosis && <DiagnosisDisplay diagnosis={diagnosis} />}
    </div>
  );
};

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <div className="h-8 w-1/3 rounded-md shimmer-bg"></div>
        <div className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="h-6 rounded w-3/4 shimmer-bg"></div>
            <div className="h-4 rounded w-full shimmer-bg"></div>
            <div className="h-4 rounded w-5/6 shimmer-bg"></div>
        </div>
         <div className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="h-6 rounded w-3/4 shimmer-bg"></div>
            <div className="h-4 rounded w-full shimmer-bg"></div>
            <div className="h-4 rounded w-5/6 shimmer-bg"></div>
        </div>
    </div>
);

const DiagnosisDisplay: React.FC<{ diagnosis: Diagnosis }> = ({ diagnosis }) => {
    const { t } = useTranslations();
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Icon name="clipboard" className="w-6 h-6 text-primary"/>
                    {t('symptomChecker.results.possibleCauses')}
                </h3>
                <div className="space-y-4">
                {diagnosis.possible_causes.map((item, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold" style={{color: 'var(--primary-color-dark)'}}>{item.cause}</h4>
                        <span className="text-sm font-bold text-primary-dark bg-primary-light px-3 py-1 rounded-full">{item.confidence}{t('symptomChecker.results.confidence')}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${item.confidence}%`, backgroundColor: 'var(--primary-color)' }}></div>
                    </div>
                    <p className="text-slate-600"><strong className="font-semibold text-slate-700">{t('symptomChecker.results.suggestedTreatment')}</strong> {item.suggested_treatment}</p>
                    </div>
                ))}
                </div>
            </div>

            {diagnosis.local_healthcare_options.length > 0 && (
            <div>
                <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Icon name="location" className="w-6 h-6 text-green-600"/>
                    {t('symptomChecker.results.localHealthcare')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnosis.local_healthcare_options.map((option, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                    <h4 className="font-semibold text-green-800">{option.name}</h4>
                    <p className="text-sm text-slate-500">{option.type}</p>
                    <p className="text-sm text-slate-600 mt-1">{option.address}</p>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
    );
}

export default SymptomChecker;