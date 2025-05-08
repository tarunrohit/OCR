import React from 'react';
import { FileText, CreditCard, ScanLine as PassportIcon } from 'lucide-react'; // Using ScanLine for Passport for variety
import { DocumentType } from '../hooks/useOCR'; // Import from hook

// Make sure these 'id' values exactly match the strings expected in useOCR.ts
const documentOptions: { id: DocumentType; name: string; icon: React.ElementType }[] = [
  { id: 'Passport', name: 'Passport', icon: PassportIcon },
  { id: 'PAN Card', name: 'PAN Card', icon: CreditCard },
  { id: 'Aadhaar Card', name: 'Aadhaar Card', icon: FileText },
];

interface DocumentSelectorProps {
  activeDocument: DocumentType;
  onSelect: (type: DocumentType) => void;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ activeDocument, onSelect }) => {
  return (
    <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
      <p className="text-md font-semibold text-indigo-800 mb-3">
        1. Select Document Type:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {documentOptions.map((doc) => {
          // Ensure doc.id is never empty for mapping. It should be 'Passport', 'PAN Card', or 'Aadhaar Card'
          if (!doc.id) return null; 
          
          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelect(doc.id)} // Critical: This passes the string 'Passport', 'PAN Card', etc.
              className={`
                flex flex-col items-center justify-center p-4 py-5 rounded-xl border-2 
                transition-all duration-200 ease-in-out transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                ${
                  activeDocument === doc.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-purple-700 shadow-xl scale-105'
                    : 'bg-white/80 hover:bg-indigo-100/70 text-indigo-700 border-indigo-300 hover:border-indigo-500 shadow-md'
                }
              `}
            >
              <doc.icon className={`h-10 w-10 mb-2.5 ${activeDocument === doc.id ? 'text-white' : 'text-purple-600'}`} strokeWidth={1.5}/>
              <span className="text-sm font-medium tracking-wide">{doc.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentSelector;