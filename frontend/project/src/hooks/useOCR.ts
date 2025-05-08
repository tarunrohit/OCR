import { useState } from 'react';

// Define the exact document type strings that DocumentSelector will pass
export type DocumentType = 'Passport' | 'PAN Card' | 'Aadhaar Card' | '';

interface UploadState {
  file: File | null;
  preview: string | null;
  loading: boolean;
  error: string | null;
}

// This OCRResult type is a union that tries to cover both API responses.
// You might refine this if you have very distinct structures.
export interface OCRResult {
  // Common fields from Passport
  "First Name"?: string;
  "Surname"?: string;
  "Passport Number"?: string;
  "Date of Birth"?: string; // Can also come from PAN/Aadhaar
  "Gender"?: string;
  "Nationality"?: string;
  "Expiration Date"?: string;
  "MRZ Raw Text"?: string;

  // Common fields from ID Card (PAN/Aadhaar) via extractor.py
  "Document_Type"?: 'PAN' | 'Aadhaar_Front' | 'Aadhaar_Back' | string; // More specific from extractor
  "PAN_No"?: string;
  "Person_Name"?: string; // Potentially from Aadhaar/PAN
  "Father_Name"?: string; // Potentially from PAN
  // ... other fields from your JSON templates like Address, etc.

  // Allow any other string keys for flexibility from extractor.py
  [key: string]: any;
}

const PASSPORT_API_URL = import.meta.env.VITE_PASSPORT_API_URL || 'http://localhost:5000/extract';
const IDCARD_API_URL = import.meta.env.VITE_IDCARD_API_URL || 'http://localhost:5001/upload';

export function useOCR() {
  const [documentType, setDocumentType] = useState<DocumentType>('');
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    loading: false,
    error: null,
  });
  const [result, setResult] = useState<OCRResult | null>(null);

  const handleDocumentTypeChange = (type: DocumentType) => {
    console.log('Document type selected:', type); // For debugging
    setDocumentType(type);
    // Optional: Clear file/preview/result when document type changes
    // clearUpload();
  };

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadState({
          file: file,
          preview: reader.result as string,
          loading: false,
          error: null,
        });
        setResult(null); // Clear previous results on new file upload
      };
      reader.readAsDataURL(file);
    } else {
      clearUpload();
    }
  };

  const clearUpload = () => {
    setUploadState({
      file: null,
      preview: null,
      loading: false,
      error: null,
    });
    setResult(null);
    // setDocumentType(''); // Optionally clear document type as well
  };

  const processImage = async () => {
    console.log('processImage called. Current documentType:', documentType); // For debugging
    if (!uploadState.file) {
      setUploadState(prev => ({ ...prev, error: 'Please upload an image first.' }));
      return;
    }
    // Critical check: Ensure documentType is one of the valid values
    if (documentType !== 'Passport' && documentType !== 'PAN Card' && documentType !== 'Aadhaar Card') {
        setUploadState(prev => ({ ...prev, loading: false, error: 'Please select a valid document type.' }));
        console.error("Invalid document type for API call:", documentType);
        return;
    }

    setUploadState(prev => ({ ...prev, loading: true, error: null }));
    setResult(null);

    const formData = new FormData();
    formData.append('image', uploadState.file);

    let apiUrl: string;
    let isPassportApi = false;

    if (documentType === 'Passport') {
      apiUrl = PASSPORT_API_URL;
      isPassportApi = true;
    } else if (documentType === 'PAN Card' || documentType === 'Aadhaar Card') {
      // For both PAN and Aadhaar, we use the IDCARD_API_URL.
      // The backend (extractor.py) will determine if it's PAN or Aadhaar.
      apiUrl = IDCARD_API_URL;
    } else {
      // This case should ideally be caught by the check above, but as a fallback:
      setUploadState(prev => ({ ...prev, loading: false, error: 'Internal error: Invalid document type routing.' }));
      console.error("Fell through to unexpected document type in API routing:", documentType);
      return;
    }

    console.log(`Sending image to: ${apiUrl} for document type: ${documentType}`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text(); // Get text first for better error inspection
      console.log('API Response Text:', responseText);

      if (!response.ok) {
        let errorData = { error: `HTTP error! Status: ${response.status}` };
        try {
          const jsonData = JSON.parse(responseText);
          errorData.error = jsonData.error || jsonData.message || errorData.error;
        } catch (e) {
          // If response text is not JSON, use the text itself or status text
           errorData.error = `${errorData.error} - ${responseText || response.statusText}`;
        }
        throw new Error(errorData.error);
      }

      const responseData = JSON.parse(responseText); // Now parse JSON if response was ok

      if (isPassportApi) {
        // Passport API returns data directly
        setResult(responseData as OCRResult);
      } else {
        // ID Card API returns data nested under "data" key
        if (responseData.data) {
          setResult(responseData.data as OCRResult);
        } else {
          throw new Error(responseData.error || 'Unexpected response format from ID card API: "data" field missing.');
        }
      }
      setUploadState(prev => ({ ...prev, loading: false }));

    } catch (error: any) {
      console.error('OCR Error:', error);
      setUploadState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'An unknown error occurred during OCR processing.',
      }));
      setResult(null);
    }
  };

  return {
    documentType,
    uploadState,
    result,
    handleDocumentTypeChange,
    handleFileUpload,
    clearUpload,
    processImage,
  };
}