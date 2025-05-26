
import Tesseract from 'tesseract.js';

export interface ReceiptValidationResult {
  isValid: boolean;
  extractedAmount?: number;
  extractedMethod?: string;
  confidence: number;
  errors: string[];
}

// Payment method patterns for validation
const PAYMENT_PATTERNS = {
  gcash: {
    keywords: ['gcash', 'globe gcash', 'mynt', 'send money'],
    amountPattern: /(?:amount|total|php|₱)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    referencePattern: /(?:reference|ref|transaction)\s*(?:no|number)?\s*:?\s*([a-z0-9]+)/i,
  },
  paymaya: {
    keywords: ['paymaya', 'maya', 'voyager innovations'],
    amountPattern: /(?:amount|total|php|₱)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    referencePattern: /(?:reference|ref|transaction)\s*(?:no|number)?\s*:?\s*([a-z0-9]+)/i,
  },
  bpi: {
    keywords: ['bpi', 'bank of the philippine islands', 'instapay', 'pesonet'],
    amountPattern: /(?:amount|total|php|₱)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    referencePattern: /(?:reference|ref|transaction)\s*(?:no|number)?\s*:?\s*([a-z0-9]+)/i,
  },
  bdo: {
    keywords: ['bdo', 'banco de oro', 'instapay', 'pesonet'],
    amountPattern: /(?:amount|total|php|₱)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    referencePattern: /(?:reference|ref|transaction)\s*(?:no|number)?\s*:?\s*([a-z0-9]+)/i,
  },
  unionbank: {
    keywords: ['unionbank', 'union bank', 'instapay', 'pesonet'],
    amountPattern: /(?:amount|total|php|₱)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    referencePattern: /(?:reference|ref|transaction)\s*(?:no|number)?\s*:?\s*([a-z0-9]+)/i,
  },
  metrobank: {
    keywords: ['metrobank', 'metropolitan bank', 'instapay', 'pesonet'],
    amountPattern: /(?:amount|total|php|₱)\s*:?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    referencePattern: /(?:reference|ref|transaction)\s*(?:no|number)?\s*:?\s*([a-z0-9]+)/i,
  },
};

export const validateReceipt = async (
  imageFile: File,
  expectedAmount: number,
  expectedMethod: string
): Promise<ReceiptValidationResult> => {
  try {
    // Extract text from image using Tesseract
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => console.log(m)
    });

    const extractedText = result.data.text.toLowerCase();
    const confidence = result.data.confidence;
    const errors: string[] = [];

    // Get payment method pattern
    const methodPattern = PAYMENT_PATTERNS[expectedMethod as keyof typeof PAYMENT_PATTERNS];
    if (!methodPattern) {
      errors.push(`Unsupported payment method: ${expectedMethod}`);
      return { isValid: false, confidence, errors };
    }

    // Check if payment method keywords are present
    const hasMethodKeywords = methodPattern.keywords.some(keyword => 
      extractedText.includes(keyword.toLowerCase())
    );

    if (!hasMethodKeywords) {
      errors.push(`Receipt does not appear to be from ${expectedMethod}`);
    }

    // Extract amount from text
    const amountMatch = extractedText.match(methodPattern.amountPattern);
    let extractedAmount: number | undefined;
    
    if (amountMatch) {
      const amountStr = amountMatch[1].replace(/,/g, '');
      extractedAmount = parseFloat(amountStr);
      
      // Check if extracted amount matches expected amount (allow 1% tolerance)
      const tolerance = expectedAmount * 0.01;
      const amountDifference = Math.abs(extractedAmount - expectedAmount);
      
      if (amountDifference > tolerance) {
        errors.push(`Amount mismatch: Expected ₱${expectedAmount}, found ₱${extractedAmount}`);
      }
    } else {
      errors.push('Could not extract amount from receipt');
    }

    // Check for reference number (optional but adds credibility)
    const hasReference = methodPattern.referencePattern.test(extractedText);
    if (!hasReference) {
      errors.push('No transaction reference found (warning only)');
    }

    // Determine if receipt is valid
    const isValid = hasMethodKeywords && extractedAmount !== undefined && 
                   Math.abs(extractedAmount - expectedAmount) <= (expectedAmount * 0.01);

    return {
      isValid,
      extractedAmount,
      extractedMethod: hasMethodKeywords ? expectedMethod : undefined,
      confidence,
      errors
    };

  } catch (error) {
    console.error('OCR Error:', error);
    return {
      isValid: false,
      confidence: 0,
      errors: ['Failed to process receipt image']
    };
  }
};
