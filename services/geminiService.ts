import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
// API Key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image using Gemini 2.5 Flash Image model based on a text prompt.
 * 
 * @param base64Image Raw base64 string of the source image
 * @param mimeType Mime type of the source image (e.g., 'image/png')
 * @param prompt Text description of the desired edit
 * @returns The base64 data URI of the generated image
 */
export async function generateEditedImage(
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content returned from Gemini API.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        // Construct the data URI for the frontend to display
        // Note: The API returns raw base64. We need to prefix it, assume PNG if not specified or check part.inlineData.mimeType if available.
        // Usually the response mimeType is consistent with the output format.
        const responseMimeType = part.inlineData.mimeType || 'image/png';
        return `data:${responseMimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
}
