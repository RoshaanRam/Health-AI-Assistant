

export interface PossibleCause {
  cause: string;
  confidence: number; // 0-100
  suggested_treatment: string;
  description: string; // New field for detailed explanation
  when_to_seek_medical_attention: string; // New field for safety advice
}

export interface LocalHealthcareOption {
  name: string;
  type: string;
  address: string;
  opening_hours?: string;
  wait_time?: string; // New field for estimated wait time
}

export interface Diagnosis {
  possible_causes: PossibleCause[];
  home_care_tips: string[]; // New field for immediate self-care advice
  local_healthcare_options: LocalHealthcareOption[];
}

export interface HealthLog {
  id: string;
  date: string; // YYYY-MM-DD
  log: string;
  summary: string;
  symptomSeverity: number; // 1-10
}

export interface GeolocationData {
    latitude: number;
    longitude: number;
}

export interface Demographics {
    age: number | null;
    gender: string;
    ethnicity: string;
}