import React from 'react';
import { OCRResult } from '../hooks/useOCR'; // Import the OCRResult type

interface ResultsDisplayProps {
  imageUrl: string;
  result: OCRResult; // Now assuming result is always non-null when this component is rendered
}

// Friendly names for keys
const KEY_MAPPINGS: Record<string, string> = {
  'Document_Type': 'Detected Document Type',
  'PAN_No': 'PAN Number',
  'Person_Name': 'Name',
  'Father_Name': "Father's Name",
  'Date of Birth': 'Date of Birth',
  'First Name': 'First Name',
  'Surname': 'Surname',
  'Passport Number': 'Passport Number',
  'Gender': 'Gender',
  'Nationality': 'Nationality',
  'Expiration Date': 'Passport Expiry Date',
  'Address': 'Address', // Common for Aadhaar
  // Add more mappings as needed based on your JSON config keys
};

// Order in which to display known keys, others will be appended
const PREFERRED_KEY_ORDER: string[] = [
  'Document_Type',
  'First Name', // Passport
  'Surname',    // Passport
  'Person_Name',// PAN/Aadhaar
  'Passport Number',
  'PAN_No',
  'Aadhaar_No', // If you extract this, add mapping
  'Date of Birth',
  'Father_Name',
  'Gender',
  'Nationality',
  'Expiration Date',
  'Address',
  // ... add more significant keys
];


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ imageUrl, result }) => {
  // Keys to explicitly ignore from displaying in the main list
  const IGNORED_KEYS = ['_id', 'image_path', 'mongodb_id', 'MRZ Raw Text', 'raw_text'];

  const renderResultDetails = (res: OCRResult) => {
    const displayedKeys = new Set<string>();

    const sortedResultEntries = PREFERRED_KEY_ORDER.map(key => {
        if (key in res && !IGNORED_KEYS.includes(key) && res[key] !== null && String(res[key]).trim() !== '') {
            displayedKeys.add(key);
            return [key, res[key]];
        }
        return null;
    }).filter(entry => entry !== null) as [string, any][];

    Object.entries(res).forEach(([key, value]) => {
        if (!displayedKeys.has(key) && !IGNORED_KEYS.includes(key) && value !== null && String(value).trim() !== '') {
            sortedResultEntries.push([key, value]);
        }
    });

    if (sortedResultEntries.length === 0) {
      return <p className="text-gray-600">No specific details extracted or all fields were empty.</p>;
    }

    return sortedResultEntries.map(([key, value]) => {
      const displayName = KEY_MAPPINGS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
      return (
        <div key={key} className="mb-3 p-3 bg-indigo-50/80 rounded-lg shadow-sm border border-indigo-200/70 animate-fadeIn">
          <strong className="text-xs sm:text-sm text-indigo-700 block font-semibold">
            {displayName}:
          </strong>
          <span className="text-sm sm:text-md text-gray-800 break-words">
            {String(value)}
          </span>
        </div>
      );
    });
  };

  const mrzText = result['MRZ Raw Text'] || result['raw_text']; // Check both potential keys from MRZ data

  return (
    <div className="animate-fadeIn">
      <h3 className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-6 pb-1 border-b border-indigo-200">
        Scan Results
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-2">
          <h4 className="text-lg font-semibold text-indigo-800 mb-3">Uploaded Image:</h4>
          <div className="rounded-xl shadow-xl overflow-hidden border border-gray-200 bg-white p-1">
            <img
                src={imageUrl}
                alt="Uploaded Document"
                className="rounded-lg w-full h-auto object-contain max-h-[300px] sm:max-h-[400px]"
            />
          </div>
        </div>
        <div className="lg:col-span-3">
          <h4 className="text-lg font-semibold text-indigo-800 mb-3">Extracted Information:</h4>
          {result ? (
            <div className="space-y-1 max-h-[450px] overflow-y-auto pr-2 nice-scrollbar">
              {renderResultDetails(result)}
            </div>
          ) : (
            <p className="text-gray-600 p-4 bg-gray-50 rounded-md">No information extracted.</p>
          )}
        </div>
      </div>
      {mrzText && (
        <div className="mt-8 animate-fadeIn" style={{animationDelay: '0.2s'}}>
          <h4 className="text-md font-semibold text-indigo-800 mb-2">MRZ (Machine Readable Zone) Text:</h4>
          <pre className="bg-gray-800 p-4 rounded-lg text-xs text-gray-100 whitespace-pre-wrap break-all shadow-md leading-relaxed font-mono">
            {mrzText}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;

// Add to your index.css or a global styles file for the scrollbar:
/*
.nice-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.nice-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.nice-scrollbar::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 10px;
}
.nice-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
*/