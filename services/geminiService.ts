
import { GoogleGenAI, Type } from "@google/genai";
import { Diagnosis, GeolocationData, HealthLog, Demographics } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const diagnosisSchema = {
    type: Type.OBJECT,
    properties: {
        possible_causes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    cause: { type: Type.STRING },
                    confidence: { type: Type.NUMBER, description: 'A score from 0 to 100 representing confidence.' },
                    suggested_treatment: { type: Type.STRING },
                },
                required: ['cause', 'confidence', 'suggested_treatment'],
            }
        },
        local_healthcare_options: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, description: 'e.g., Hospital, Clinic, Pharmacy' },
                    address: { type: Type.STRING },
                },
                required: ['name', 'type', 'address'],
            }
        }
    },
    required: ['possible_causes', 'local_healthcare_options'],
};

export const getDiagnosis = async (symptoms: string, location: GeolocationData | null, demographics: Demographics): Promise<Diagnosis> => {
    const locationInfo = location ? `The user is currently near latitude ${location.latitude} and longitude ${location.longitude}.` : "The user's location is not available.";
    
    let demographicsInfo = 'The user has not provided demographic information.';
    const parts = [];
    if (demographics.age) parts.push(`Age: ${demographics.age}`);
    if (demographics.gender && demographics.gender !== 'Prefer not to say' && demographics.gender !== '') parts.push(`Gender: ${demographics.gender}`);
    if (demographics.ethnicity && demographics.ethnicity !== 'Prefer not to say' && demographics.ethnicity !== '') parts.push(`Ethnicity: ${demographics.ethnicity}`);
    
    if (parts.length > 0) {
        demographicsInfo = `The user's demographic profile is: ${parts.join(', ')}. Certain conditions can be more prevalent in specific demographic groups, so consider this information in your analysis.`;
    }

    const prompt = `
        You are an advanced AI medical assistant. A user has reported the following symptoms: "${symptoms}".
        ${demographicsInfo}
        ${locationInfo}
        
        Based on all this information, please provide a structured analysis including:
        1. A list of possible causes, each with a confidence score (0-100) and a brief, clear suggested treatment plan.
        2. A list of 3-4 relevant local healthcare options (like clinics, hospitals, or pharmacies) if the location is known. If the location is not available, provide generic advice on finding local care.
        
        Return the response in a JSON format matching the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: diagnosisSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Diagnosis;

    } catch (error) {
        console.error("Error fetching diagnosis from Gemini API:", error);
        throw new Error("Failed to get a diagnosis. The AI model may be temporarily unavailable.");
    }
};

export const getHealthLogSummary = async (log: string): Promise<string> => {
    const prompt = `Summarize the following health log entry into a short, one-sentence summary for a calendar view. Start the summary with a relevant emoji.
    
    Log: "${log}"
    
    Summary:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching summary from Gemini API:", error);
        return "📄 Logged"; // Fallback summary
    }
};

export const getHealthAnalysis = async (logs: HealthLog[]): Promise<string> => {
    const formattedLogs = logs.map(l => `Date: ${l.date}, Log: ${l.log}, Severity: ${l.symptomSeverity}/10`).join('\n');
    
    const prompt = `
        You are a helpful AI health analysis assistant. Analyze the following health logs from a user.
        
        Logs:
        ${formattedLogs}
        
        Based on these logs, identify potential trends, patterns, and correlations. Provide a concise analysis and actionable insights. For example, mention if certain symptoms appear cyclically or if there's a general trend of improvement or decline. Frame your response in a helpful and supportive tone.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error fetching health analysis from Gemini API:", error);
        throw new Error("Failed to get health analysis. The AI model may be temporarily unavailable.");
    }
};
