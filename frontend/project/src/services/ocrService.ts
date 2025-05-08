import { DocumentType, OCRResult } from '../types';

// Sample passport OCR data
const passportSampleData = {
  name: 'JANE SMITH',
  nationality: 'USA',
  passport_no: 'P1234567890',
  date_of_birth: '15 JAN 1985',
  date_of_issue: '01 JAN 2020',
  date_of_expiry: '01 JAN 2030',
  authority: 'DEPARTMENT OF STATE',
};

// Sample identity card OCR data
const identitySampleData = {
  name: 'JOHN DOE',
  id_number: 'ID987654321',
  date_of_birth: '01 FEB 1990',
  address: '123 MAIN STREET, ANYTOWN, USA 12345',
  date_of_issue: '15 MAR 2022',
  date_of_expiry: '15 MAR 2032',
};

/**
 * Simulates OCR processing on the image
 */
export const processOCR = async (
  file: File,
  documentType: DocumentType
): Promise<OCRResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Determine which sample data to use based on document type
  const data = documentType === 'passport' ? passportSampleData : identitySampleData;
  
  // Format the data into a string
  let text = '';
  Object.entries(data).forEach(([key, value]) => {
    // Format the key by replacing underscores with spaces and capitalizing
    const formattedKey = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    text += `${formattedKey}: ${value}\n`;
  });
  
  // Generate a random confidence score between 85-99%
  const confidence = Math.floor(Math.random() * 15) + 85;
  
  // Generate a random processing time between 500-2000ms
  const processingTimeMs = Math.floor(Math.random() * 1500) + 500;
  
  return {
    text,
    confidence,
    processingTimeMs,
  };
};

/**
 * Generates a text file containing the OCR results
 */
export const generateOCRTextFile = (result: OCRResult): string => {
  const blob = new Blob([result.text], { type: 'text/plain' });
  return URL.createObjectURL(blob);
};