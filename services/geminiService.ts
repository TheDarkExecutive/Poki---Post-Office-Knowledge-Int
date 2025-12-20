import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API client safely
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Indian PIN Region Mapping (First Digit)
 */
const REGION_MAP: Record<string, string[]> = {
  '1': ['Delhi', 'Haryana', 'Punjab', 'Himachal', 'Jammu', 'Kashmir', 'Chandigarh'],
  '2': ['Uttar Pradesh', 'Uttarakhand'],
  '3': ['Rajasthan', 'Gujarat', 'Daman', 'Diu', 'Dadra'],
  '4': ['Maharashtra', 'Goa', 'Madhya Pradesh', 'Chhattisgarh'],
  '5': ['Andhra Pradesh', 'Telangana', 'Karnataka'],
  '6': ['Tamil Nadu', 'Kerala', 'Puducherry', 'Lakshadweep'],
  '7': ['West Bengal', 'Odisha', 'Assam', 'Sikkim', 'Arunachal', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura', 'Meghalaya'],
  '8': ['Bihar', 'Jharkhand'],
  '9': ['Army Postal Service', 'Field Post Office']
};

export const PINCODE_DATABASE = [
  { pincode: '500001', region: 'South', state: 'Telangana', district: 'Hyderabad' },
  { pincode: '560001', region: 'South', state: 'Karnataka', district: 'Bangalore' },
  { pincode: '600001', region: 'South', state: 'Tamil Nadu', district: 'Chennai' },
  { pincode: '682001', region: 'South', state: 'Kerala', district: 'Ernakulam' },
  { pincode: '110001', region: 'North', state: 'Delhi', district: 'New Delhi' },
  { pincode: '110002', region: 'North', state: 'Delhi', district: 'New Delhi' },
  { pincode: '110003', region: 'North', state: 'Delhi', district: 'New Delhi' },
  { pincode: '400001', region: 'West', state: 'Maharashtra', district: 'Mumbai' },
  { pincode: '700001', region: 'East', state: 'West Bengal', district: 'Kolkata' },
  { pincode: '302001', region: 'North', state: 'Rajasthan', district: 'Jaipur' },
];

export interface ExtractedMailData {
  trackingId: string;
  recipientName: string;
  address: string;
  pincode: string;
  isValid: boolean;
  pincodeWarning?: string;
  error?: string;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 4, initialDelay = 1500): Promise<T> {
  let currentDelay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = 
        error?.status === 429 || 
        error?.status === 500 || 
        error?.status === 503 || 
        error?.status === 504 || 
        error?.message?.includes('fetch') || 
        error?.message?.includes('network');

      if (isRetryable && i < maxRetries - 1) {
        console.warn(`Transient error encountered. Retrying in ${currentDelay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, currentDelay));
        currentDelay *= 1.5;
        continue;
      }
      throw error;
    }
  }
  throw new Error("RETRY_LIMIT_EXCEEDED");
}

const validatePostalData = (data: ExtractedMailData): string | undefined => {
  const pin = data.pincode;
  const addr = data.address.toLowerCase();

  const match = PINCODE_DATABASE.find(entry => entry.pincode === pin);
  if (match) {
    const stateMatch = addr.includes(match.state.toLowerCase());
    const districtMatch = addr.includes(match.district.toLowerCase()) || 
                         (match.district === 'Bangalore' && addr.includes('bengaluru'));
    if (!stateMatch || !districtMatch) {
      return `MISMATCH: PIN ${pin} IS ${match.district}, ${match.state}`;
    }
    return undefined;
  }

  const firstDigit = pin[0];
  const validStates = REGION_MAP[firstDigit];
  if (validStates) {
    const hasValidState = validStates.some(state => addr.includes(state.toLowerCase()));
    if (!hasValidState) {
      const regionName = firstDigit === '1' || firstDigit === '2' ? 'NORTH' :
                         firstDigit === '3' || firstDigit === '4' ? 'WEST' :
                         firstDigit === '5' || firstDigit === '6' ? 'SOUTH' : 'EAST';
      return `REGION MISMATCH: PIN ${pin} IS ${regionName} INDIA`;
    }
  } else {
    return `INVALID PIN PREFIX: ${pin}`;
  }

  return undefined;
};

export const extractMailDetails = async (base64Image: string): Promise<ExtractedMailData | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing. Check your environment variables.");
    return { isValid: false, error: "CONFIG_ERROR", trackingId: '', recipientName: '', address: '', pincode: '' };
  }

  try {
    return await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
              { text: "CRITICAL TASK: Extract data from this Indian postal label. If the image is blurry, use contextual knowledge of Indian geography (states, cities, districts) to correct errors in OCR. Specifically look for a 6-digit PIN code and verify it against the state mentioned in the address." }
            ]
          }
        ],
        config: {
          systemInstruction: "You are a master Indian Postal Sorter with superior pattern recognition. Extract: Tracking ID, Recipient Name, Full Address, and a 6-digit PIN. If characters are low-confidence due to blur, intelligently infer based on common Indian naming conventions and geography. Return 'N/A' only if completely unreadable. 'isValid' should be true if a plausible 6-digit PIN is found.",
          temperature: 0.1, 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trackingId: { type: Type.STRING },
              recipientName: { type: Type.STRING },
              address: { type: Type.STRING },
              pincode: { type: Type.STRING },
              isValid: { type: Type.BOOLEAN },
            },
            required: ["trackingId", "recipientName", "address", "pincode", "isValid"],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim()) as ExtractedMailData;
        
        // Clean PIN code of non-digits that might arise from noise
        parsed.pincode = (parsed.pincode || '').replace(/\D/g, '');
        
        if (parsed.isValid && /^\d{6}$/.test(parsed.pincode)) {
          parsed.pincodeWarning = validatePostalData(parsed);
        } else {
          // If the model produced a non-6-digit PIN, it's invalid
          if (parsed.pincode.length !== 6) parsed.isValid = false;
        }
        return parsed;
      }
      return null;
    });
  } catch (error: any) {
    console.error("Gemini OCR Failure:", error);
    if (error.message === "RETRY_LIMIT_EXCEEDED") {
      return { isValid: false, error: "CONGESTION", trackingId: '', recipientName: '', address: '', pincode: '' };
    }
    return null;
  }
};