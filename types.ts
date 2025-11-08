

export interface PossibleCause {
  cause: string;
  confidence: number; // 0-100
  suggested_treatment: string;
}

export interface LocalHealthcareOption {
  name: string;
  type: string;
  address: string;
  opening_hours?: string;
}

export interface Diagnosis {
  possible_causes: PossibleCause[];
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