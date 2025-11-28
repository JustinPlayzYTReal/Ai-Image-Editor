/**
 * Converts a File object to a Base64 string and extracts the raw data and mime type.
 */
export const processFile = (file: File): Promise<{ base64Data: string; mimeType: string; previewUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is like "data:image/png;base64,iVBORw0KGgoAAA..."
      const [header, base64Data] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
      
      resolve({
        base64Data, // Raw base64 for Gemini
        mimeType,
        previewUrl: result // Full data URI for <img> src
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Parses a Data URL to extract base64 data and mime type.
 */
export const parseDataUrl = (dataUrl: string): { base64Data: string; mimeType: string } | null => {
  try {
    const [header, base64Data] = dataUrl.split(',');
    if (!header || !base64Data) return null;
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType) return null;
    return { base64Data, mimeType };
  } catch (e) {
    console.error("Error parsing data URL", e);
    return null;
  }
};
