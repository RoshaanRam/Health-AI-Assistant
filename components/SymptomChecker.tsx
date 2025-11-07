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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Diagnosis, GeolocationData, Demographics } from '../types';
import { getDiagnosis } from '../services/geminiService';
import { Icon } from './common/Icon';

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
        setError("Could not get location. Local healthcare suggestions will be generic.");
      }
    );
  }, []);

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
    recognition.lang = 'en-US';

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
      setError(`Speech recognition error: ${event.error}. Please ensure microphone access is granted.`);
      setIsRecording(false);
    };

    return () => {
      recognition.stop();
    };
  }, [setError]);

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
      const result = await getDiagnosis(symptoms, geolocation, demographics);
      setDiagnosis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [symptoms, geolocation, isLoading, age, gender, ethnicity]);

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-600 mb-1">Age</label>
                <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-2 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    disabled={isLoading}
                    min="0"
                    placeholder="e.g., 35"
                />
            </div>
            <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    disabled={isLoading}
                >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                </select>
            </div>
            <div>
                <label htmlFor="ethnicity" className="block text-sm font-medium text-slate-600 mb-1">Ethnicity</label>
                <select
                    id="ethnicity"
                    value={ethnicity}
                    onChange={(e) => setEthnicity(e.target.value)}
                    className="w-full p-2 text-slate-600 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    disabled={isLoading}
                >
                    <option value="">Select...</option>
                    <option value="White">White</option>
                    <option value="South Asian">South Asian</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Black">Black</option>
                    <option value="Filipino">Filipino</option>
                    <option value="Latin American">Latin American</option>
                    <option value="Arab">Arab</option>
                    <option value="Southeast Asian">Southeast Asian</option>
                    <option value="West Asian">West Asian</option>
                    <option value="Korean">Korean</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Indigenous">Indigenous (First Nations, Métis, Inuit)</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                </select>
            </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Describe Your Symptoms</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., 'I have a sore throat, a slight fever, and a cough...'"
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
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              title={!speechSupported ? "Voice input not supported in your browser" : (isRecording ? "Stop recording" : "Start recording")}
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
                Analyzing...
              </>
            ) : (
              <>
                <Icon name="sparkles" className="w-5 h-5" />
                Get AI Analysis
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
    <div className="animate-pulse space-y-6">
        <div className="bg-slate-200 h-8 w-1/3 rounded-md"></div>
        <div className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
         <div className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
    </div>
);

const DiagnosisDisplay: React.FC<{ diagnosis: Diagnosis }> = ({ diagnosis }) => (
  <div className="space-y-8">
    <div>
        <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Icon name="clipboard" className="w-6 h-6 text-primary"/>
            Possible Causes
        </h3>
        <div className="space-y-4">
        {diagnosis.possible_causes.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold" style={{color: 'var(--primary-color-dark)'}}>{item.cause}</h4>
                <span className="text-sm font-bold text-primary-dark bg-primary-light px-3 py-1 rounded-full">{item.confidence}% Confidence</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${item.confidence}%`, backgroundColor: 'var(--primary-color)' }}></div>
            </div>
            <p className="text-slate-600"><strong className="font-semibold text-slate-700">Suggested Treatment:</strong> {item.suggested_treatment}</p>
            </div>
        ))}
        </div>
    </div>

    {diagnosis.local_healthcare_options.length > 0 && (
      <div>
        <h3 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Icon name="location" className="w-6 h-6 text-green-600"/>
            Local Healthcare Options
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

export default SymptomChecker;