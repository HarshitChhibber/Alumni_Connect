import Tesseract from "tesseract.js";

/**
 * Generic OCR Verifier
 * @param {string} imageUrl - Cloudinary URL of the image
 * @param {Array<string>} keywords - Array of strings to find (e.g., [Name, RollNo, UniName])
 * @returns {Promise<Object>} - { success: boolean, text: string }
 */
export const verifyDocumentOCR = async (imageUrl, keywords) => {
  try {
    console.log(`📝 Starting OCR on: ${imageUrl}`);
    console.log(`🔍 Looking for keywords:`, keywords);

    const { data: { text } } = await Tesseract.recognize(imageUrl, "eng");

    // Clean text: lowercase, remove special chars, remove extra spaces
    const extractedText = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ");
    
    console.log("📄 Extracted Text (Snippet):", extractedText.substring(0, 100) + "...");

    // Check if ALL keywords exist in the text
    const allMatchesFound = keywords.every((keyword) => {
      if (!keyword) return true; // Skip empty checks
      
      const cleanKeyword = keyword.toLowerCase().trim();
      
      // If keyword is multi-word (e.g., "Rahul Sharma"), check parts or full
      // For strict verification, we usually check if the full phrase exists OR significant parts exist.
      // Here, strict inclusion:
      return extractedText.includes(cleanKeyword);
    });

    if (allMatchesFound) {
      return { success: true, text: extractedText };
    } else {
      return { success: false, text: extractedText };
    }

  } catch (error) {
    console.error("❌ OCR Error:", error);
    return { success: false, error: error.message };
  }
};