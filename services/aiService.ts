import { GoogleGenAI, Type } from '@google/genai';
import type { VerificationResult, ChatMessage, UserRole } from '../types';

// Helper function to convert a File object to a base64 encoded string.
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // The result is a data URL: "data:mime/type;base64,the-real-base64-string".
            // We only need the base64 part after the comma.
            if (result.includes(',')) {
                resolve(result.split(',')[1]);
            } else {
                reject(new Error("Invalid data URL format"));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};

// Helper function to extract base64 data and mime type from a data URL.
const dataUrlToApiParts = (dataUrl: string): { mimeType: string, data: string } => {
    const parts = dataUrl.split(',');
    const meta = parts[0];
    const data = parts[1];
    const mimeType = meta.match(/:(.*?);/)?.[1];
    if (!mimeType || !data) {
        throw new Error("Invalid data URL for API conversion");
    }
    return { mimeType, data };
}


// Fix: Initialize GoogleGenAI with API Key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The OTP generation is a simple utility and does not require AI. The mock is kept.
export const generateOTP = async (): Promise<string> => {
  console.log("AI Service: Generating OTP...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`AI Service: Generated OTP is ${otp}`);
  return otp;
};

// This function is kept for potential future use but is no longer called by the FarmerDashboard.
export const verifyLabReport = async (
  file: File,
  batchId: string,
  herbSpecies: string,
  weight: number
): Promise<VerificationResult> => {
  console.log("AI Service: Verifying lab report with Gemini...", { fileName: file.name, batchId });

  try {
    const base64Data = await fileToBase64(file);

    const textPart = {
      text: `Analyze the attached lab report for a batch of ${herbSpecies}.
      Batch ID is ${batchId}. Weight is ${weight}kg.
      Determine if the batch passes quality control based on standard herbal safety parameters (e.g., heavy metals, pesticides, microbial content).
      Provide a boolean 'passed' status, a numeric 'confidence' score (0-100), and a brief 'details' summary.
      Respond ONLY with a JSON object matching the specified schema.`,
    };

    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            details: { type: Type.STRING },
          },
          required: ["passed", "confidence", "details"],
        },
      },
    });

    const jsonString = response.text.trim();
    console.log("AI Service: Raw Gemini Response:", jsonString);
    let aiResult;
    try {
      aiResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("AI Service: Failed to parse JSON response from Gemini", parseError);
      throw new Error("AI returned an invalid response format.");
    }

    const result: VerificationResult = {
      passed: aiResult.passed,
      confidence: aiResult.confidence,
      details: aiResult.details,
      batchId,
      herbSpecies,
      weight,
    };

    console.log("AI Service: Verification complete.", result);
    return result;

  } catch (error) {
    console.error("AI Service: Error during Gemini API call", error);
    let errorMessage = 'AI verification failed. Please try again later.';
    if (error instanceof Error) {
        errorMessage = `AI verification failed: ${error.message}.`;
    }
    throw new Error(errorMessage);
  }
};

interface HarvestSubmissionData {
  batchId: string;
  herbSpecies: string;
  weight: number;
  geoLocation: string;
  harvestSeason: string;
}

export const verifyHarvestSubmission = async (
  data: HarvestSubmissionData
): Promise<VerificationResult> => {
  const { batchId, herbSpecies, weight, geoLocation, harvestSeason } = data;
  console.log("AI Service: Verifying harvest submission with Gemini...", data);

  try {
    const textPart = {
      text: `Act as an agricultural expert. Analyze the following harvest data for plausibility.
      - Herb Species: "${herbSpecies}"
      - Weight: ${weight}kg
      - Geo Location: "${geoLocation}"
      - Season of Harvest: "${harvestSeason}"
      
      Based on your knowledge, is it plausible for this herb to be harvested in this location during this season?
      Consider typical growing conditions, climates, and harvesting times.
      Provide a boolean 'passed' status, a numeric 'confidence' score (0-100) on the plausibility, and a brief 'details' summary explaining your reasoning.
      For example, if it's Tulsi in India during Monsoon, it's plausible. If it's Tulsi in Antarctica during winter, it's not.
      Respond ONLY with a JSON object matching the specified schema.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            details: { type: Type.STRING },
          },
          required: ["passed", "confidence", "details"],
        },
      },
    });

    const jsonString = response.text.trim();
    console.log("AI Service: Raw Gemini Response:", jsonString);
    let aiResult;
    try {
      aiResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("AI Service: Failed to parse JSON response from Gemini", parseError);
      throw new Error("AI returned an invalid response format.");
    }

    const result: VerificationResult = {
      passed: aiResult.passed,
      confidence: aiResult.confidence,
      details: aiResult.details,
      batchId,
      herbSpecies,
      weight,
    };

    console.log("AI Service: Verification complete.", result);
    return result;

  } catch (error) {
    console.error("AI Service: Error during Gemini API call", error);
    let errorMessage = 'AI verification failed. Please try again later.';
    if (error instanceof Error) {
        errorMessage = `AI verification failed: ${error.message}.`;
    }
    throw new Error(errorMessage);
  }
};

interface HarvestImageSubmissionData {
  file: File;
  batchId: string;
  herbSpecies: string;
  weight: number;
  harvestSeason: string;
}

export const verifyHarvestImage = async (
  data: HarvestImageSubmissionData
): Promise<VerificationResult> => {
  const { file, batchId, herbSpecies, weight, harvestSeason } = data;
  console.log("AI Service: Verifying harvest image with Gemini...", { fileName: file.name, ...data });

  try {
    const base64Data = await fileToBase64(file);

    const textPart = {
      text: `Act as a botanist and agricultural expert. Analyze the attached image of a harvested herb.
      The farmer has provided the following details:
      - Batch ID: ${batchId}
      - Declared Herb Species: "${herbSpecies}"
      - Weight: ${weight}kg
      - Season of Harvest: "${harvestSeason}"

      Based on the image, does it look like a legitimate, fresh harvest of "${herbSpecies}"?
      Assess the visual quality. Are there any visible signs of contamination, disease, or mishandling?
      Provide a boolean 'passed' status, a numeric 'confidence' score (0-100) on the image's authenticity and quality, and a brief 'details' summary explaining your reasoning.
      Respond ONLY with a JSON object matching the specified schema.`,
    };

    const imagePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            details: { type: Type.STRING },
          },
          required: ["passed", "confidence", "details"],
        },
      },
    });

    const jsonString = response.text.trim();
    console.log("AI Service: Raw Gemini Response for Image Verification:", jsonString);
    let aiResult;
    try {
      aiResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("AI Service: Failed to parse JSON response from Gemini", parseError);
      throw new Error("AI returned an invalid response format.");
    }

    const result: VerificationResult = {
      passed: aiResult.passed,
      confidence: aiResult.confidence,
      details: aiResult.details,
      batchId,
      herbSpecies,
      weight,
    };

    console.log("AI Service: Image verification complete.", result);
    return result;

  } catch (error) {
    console.error("AI Service: Error during Gemini API call for image verification", error);
    let errorMessage = 'AI image verification failed. Please try again later.';
    if (error instanceof Error) {
        errorMessage = `AI image verification failed: ${error.message}.`;
    }
    throw new Error(errorMessage);
  }
};


// New function for AI rejection verification.
export const verifyRejection = async (
  name: string,
  userId: string,
  role: string,
  idProof: string
): Promise<{ justified: boolean; reason: string }> => {
  console.log("AI Service: Verifying rejection justification with Gemini...", { name, userId, role, idProof });

  try {
    const textPart = {
      text: `Act as a compliance officer AI. A new user registration is being rejected by a human admin.
      Review the details and determine if the rejection is potentially justified based on common red flags.
      User Details:
      - Name: "${name}"
      - User ID: "${userId}"
      - Role: "${role}"
      - ID Proof Document: "${idProof}"

      Analyze for inconsistencies or suspicious patterns (e.g., name doesn't match a typical name format, User ID is gibberish, ID proof filename looks suspicious like 'not_a_real_id.jpg').
      Provide a brief analysis and a conclusion.
      Respond ONLY with a JSON object matching the specified schema.
      Example of a justified rejection: "The user ID 'hacker123' is unprofessional and could pose a security risk."
      Example of an unjustified rejection: "The user details appear standard; the rejection reason is unclear from the data provided."`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            justified: { type: Type.BOOLEAN, description: "Whether the rejection seems justified based on the provided data." },
            reason: { type: Type.STRING, description: "A brief explanation for your decision." },
          },
          required: ["justified", "reason"],
        },
      },
    });

    const jsonString = response.text.trim();
    console.log("AI Service: Raw Gemini Response for Rejection Verification:", jsonString);
    const aiResult = JSON.parse(jsonString);

    console.log("AI Service: Rejection verification complete.", aiResult);
    return aiResult;

  } catch (error) {
    console.error("AI Service: Error during Gemini API call for rejection verification", error);
    // Return a default response in case of AI failure to not block the admin's workflow.
    return {
      justified: false,
      reason: "AI verification service failed. The reason for rejection could not be assessed by the AI. Please review manually.",
    };
  }
};

const getSystemInstruction = (context: string, userRole: UserRole, language: string): string => {
  const langMap: { [key: string]: string } = { 'en': 'English', 'hi': 'Hindi', 'ta': 'Tamil' };
  const preferredLanguage = langMap[language] || 'English';
  
  const baseInstruction = `You are SafeRoot AI, a helpful, friendly, and professional assistant for an herbal supply chain application. Your name is RootBot.
  Your primary goal is to assist the user with their current task. Provide concise, helpful, and relevant information.
  Never ask for personally identifiable information like passwords or real names.
  The user's role is ${userRole}.
  **Crucially, you must respond in the user's preferred language, which is: ${preferredLanguage}.**`;

  const contextInstructions: { [key: string]: string } = {
    RoleSelectionScreen: `The user is on their main dashboard. They see a list of actions for their role. Help them understand what each action does or answer general questions about the SafeRoot platform and its purpose.`,
    FarmerDashboard: `The user is a farmer. If they upload an image of an herb, your primary task is to act as an expert botanist. Identify the herb, then provide a brief summary including its common name, simple harvesting tips, and potential market value. If the image is unclear or not an herb, state that you cannot identify it. For all other questions, help them fill out the harvest submission form correctly. You can explain what a 'Batch ID' is (a unique identifier for their harvest), what 'Geo-location' is used for (to verify plausible growing conditions), and why 'Harvest Season' is important for quality control.`,
    AdminDashboard: `The user is an Admin reviewing new user registrations. They can approve or reject users. Explain the importance of verifying ID proofs to maintain the integrity of the supply chain. Advise them on what to look for when approving a new user for a specific role (e.g., a Farmer should have valid farm registration).`,
    UserProfileScreen: `The user is on their profile screen. They can change their language or password. Help them with questions about password security best practices (e.g., using a mix of characters) or how changing the language affects the app.`,
    BioWasteRoutingScreen: `The user is routing bio-waste. Explain what each field means and emphasize the importance of responsible waste disposal for sustainability and compliance in the supply chain.`,
    CustomerDashboard: `The user is a customer about to scan a product QR code. Explain that scanning the code will reveal the product's full journey, from the farm to the shelf, ensuring transparency and trust.`,
  };

  return `${baseInstruction}\n\n**Current Context:**\nThe user is on the **${context}** screen. ${contextInstructions[context] || 'You can provide general assistance about the app.'}`;
};


export const getChatbotResponse = async (
  messages: ChatMessage[],
  context: string,
  userRole: UserRole,
  language: string
): Promise<string> => {
  console.log("AI Service: Getting chatbot response for context:", context, "in", language);

  try {
    const systemInstruction = getSystemInstruction(context, userRole, language);
    const lastMessage = messages[messages.length - 1];

    let contents: any;

    if (lastMessage?.sender === 'user' && lastMessage.image) {
      // This is a multimodal request
      const { mimeType, data } = dataUrlToApiParts(lastMessage.image);
      const imagePart = { inlineData: { mimeType, data } };
      
      const herbScanPrompt = `The user, a Farmer, has uploaded this image. Please identify the herb and provide a brief summary about it (common name, harvesting tips, potential market value). If there is text with the image, use it as additional context.`;
      const textPart = { text: lastMessage.text ? `${herbScanPrompt}\n\nUser's message: "${lastMessage.text}"` : herbScanPrompt };

      contents = [{ role: 'user', parts: [imagePart, textPart] }];
    } else {
      // This is a text-only request
      contents = messages.map(msg => ({
          role: msg.sender === 'ai' ? 'model' : 'user',
          parts: [{ text: msg.text }],
      }));
    }


    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction
        }
    });
    
    const text = response.text;
    if (!text) {
        throw new Error("AI returned an empty response.");
    }
    
    console.log("AI Service: Chatbot response received:", text);
    return text;

  } catch (error) {
    console.error("AI Service: Error during Gemini API call for chatbot", error);
    let errorMessage = 'I seem to be having trouble connecting. Please try again in a moment.';
    if (error instanceof Error) {
        errorMessage = `Sorry, an error occurred: ${error.message}.`;
    }
    return errorMessage;
  }
};

/**
 * Generates a brief explanation for a user role.
 * @param role The user role to explain.
 * @returns A promise that resolves to the explanation string.
 */
export const getRoleExplanation = async (role: UserRole): Promise<string> => {
  console.log("AI Service: Generating explanation for role:", role);
  try {
    const prompt = `You are an AI for the "SafeRoot" herbal supply chain platform.
    Briefly explain the primary function of the "${role}" role in one short sentence.
    Keep the explanation under 25 words and frame it from the user's perspective (e.g., "As a Farmer, you will...").`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    const text = response.text;
    if (!text) {
        throw new Error("AI returned an empty response for role explanation.");
    }
    console.log(`AI Service: Explanation for ${role}:`, text);
    return text;
  } catch (error) {
    console.error(`AI Service: Error generating explanation for role ${role}`, error);
    return "Could not load role description at this time.";
  }
};