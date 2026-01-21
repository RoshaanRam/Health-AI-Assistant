import { GoogleGenAI, Type } from "@google/genai";
import { Diagnosis, GeolocationData, HealthLog, Demographics } from "../types";
import { LanguageCode, languages } from "../translations";

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
                    description: { type: Type.STRING, description: 'A detailed explanation of what this condition is, written in simple terms.' },
                    when_to_seek_medical_attention: { type: Type.STRING, description: 'Specific signs or symptoms indicating the user should see a doctor for this specific condition.' },
                },
                required: ['cause', 'confidence', 'suggested_treatment', 'description', 'when_to_seek_medical_attention'],
            }
        },
        home_care_tips: {
            type: Type.ARRAY,
            description: "A list of 3-5 practical, non-medical things the user can do immediately at home to relieve symptoms (e.g., 'Drink plenty of water', 'Apply a cold compress').",
            items: {
                type: Type.STRING
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
                    opening_hours: { type: Type.STRING, description: 'Opening and closing hours, if available. e.g., Mon-Fri 9:00 AM - 5:00 PM' },
                    wait_time: { type: Type.STRING, description: 'Estimated current wait time based on facility type (e.g., "Approx. 2 hours", "Variable", "Low"). If unknown, provide a general estimate.' },
                },
                required: ['name', 'type', 'address'],
            }
        }
    },
    required: ['possible_causes', 'home_care_tips', 'local_healthcare_options'],
};

const questionsSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 3 clarifying questions."
        }
    },
    required: ['questions']
};

export const getFollowUpQuestions = async (symptoms: string, language: LanguageCode): Promise<string[]> => {
    const languageName = languages[language];
    const prompt = `
        You are a medical triage assistant. A user has reported the following symptoms: "${symptoms}".
        
        Generate exactly 3 specific, simple follow-up questions that would help clarify the diagnosis or rule out serious conditions.
        Focus on duration, severity, or associated symptoms that weren't mentioned.
        
        IMPORTANT: The questions must be in ${languageName}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: questionsSchema
            }
        });
        
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data.questions || [];
    } catch (error) {
        console.error("Error generating follow-up questions:", error);
        return [];
    }
}

export const getDiagnosis = async (
    symptoms: string, 
    followUpAnswers: Record<string, string>,
    location: GeolocationData | null, 
    demographics: Demographics, 
    language: LanguageCode
): Promise<Diagnosis> => {
    const locationInfo = location ? `The user is currently near latitude ${location.latitude} and longitude ${location.longitude}.` : "The user's location is not available.";
    
    let demographicsInfo = 'The user has not provided demographic information.';
    const parts = [];
    if (demographics.age) parts.push(`Age: ${demographics.age}`);
    if (demographics.gender && demographics.gender !== 'Prefer not to say' && demographics.gender !== '') parts.push(`Gender: ${demographics.gender}`);
    if (demographics.ethnicity && demographics.ethnicity !== 'Prefer not to say' && demographics.ethnicity !== '') parts.push(`Ethnicity: ${demographics.ethnicity}`);
    
    if (parts.length > 0) {
        demographicsInfo = `The user's demographic profile is: ${parts.join(', ')}. Certain conditions can be more prevalent in specific demographic groups, so consider this information in your analysis.`;
    }

    let answerContext = "";
    if (Object.keys(followUpAnswers).length > 0) {
        answerContext = "The user has provided the following answers to clarifying questions:\n";
        Object.entries(followUpAnswers).forEach(([question, answer]) => {
            answerContext += `- Question: "${question}" Answer: "${answer}"\n`;
        });
    }

    const languageName = languages[language];
    const prompt = `
        You are an advanced AI medical assistant. A user has reported the following symptoms: "${symptoms}".
        ${demographicsInfo}
        ${answerContext}
        ${locationInfo}
        
        Based on all this information, please provide a structured analysis including:
        1. A list of possible causes. For each cause, provide:
           - A confidence score (0-100). **CRITICAL:** Be conservative with confidence scores. Do NOT assign high confidence (>80%) to severe or life-threatening conditions (like cancer, heart attack) unless the symptoms are extremely specific and distinctive. If symptoms are vague (e.g., headache, fatigue), confidence should be lower (e.g., 30-50%). Aim for a "Match Score" rather than a probability of truth.
           - A detailed description of the condition.
           - A suggested treatment plan.
           - Specific advice on when to seek medical attention for this particular cause.
        2. A list of 3-5 immediate, practical "Home Care" tips. These should be safe actions the user can take right now to feel better (e.g. hydration, rest positions, over-the-counter suggestions if appropriate).
        3. A list of 3-4 relevant local healthcare options (like clinics, hospitals, or pharmacies) if the location is known. Include their opening hours if available, and an estimated wait time (e.g. 'Short', 'Avg 1hr', 'Variable') based on the facility type. If the location is not available, provide generic advice on finding local care.
        
        IMPORTANT: Your entire response, including all text in the final JSON output, must be in ${languageName}.
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

export const getHealthLogSummary = async (log: string, language: LanguageCode): Promise<string> => {
    const languageName = languages[language];
    const prompt = `Summarize the following health log entry into a short, one-sentence summary for a calendar view. Start the summary with a relevant emoji.
    
    Log: "${log}"
    
    IMPORTANT: The summary must be in ${languageName}.
    
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

export const getHealthAnalysis = async (logs: HealthLog[], language: LanguageCode): Promise<string> => {
    const formattedLogs = logs.map(l => `Date: ${l.date}, Log: ${l.log}, Severity: ${l.symptomSeverity}/10`).join('\n');
    const languageName = languages[language];
    
    const prompt = `
        You are a helpful AI health analysis assistant. Analyze the following health logs from a user.
        
        Logs:
        ${formattedLogs}
        
        Based on these logs, identify potential trends, patterns, and correlations. Provide a concise analysis and actionable insights. For example, mention if certain symptoms appear cyclically or if there's a general trend of improvement or decline. Frame your response in a helpful and supportive tone.
        
        IMPORTANT: Your entire analysis must be in ${languageName}.
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