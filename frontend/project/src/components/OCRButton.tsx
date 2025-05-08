import React from 'react';
import { ScanSearch, Loader2 } from 'lucide-react';

interface OCRButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const OCRButton: React.FC<OCRButtonProps> = ({ onClick, isLoading, disabled }) => {
  return (
    <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`
          w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-transparent 
          text-base font-semibold rounded-xl shadow-lg text-white 
          bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
          transition-all duration-200 ease-in-out transform hover:scale-105
          ${(disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl'}
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
            Processing...
          </>
        ) : (
          <>
            <ScanSearch className="h-6 w-6 mr-2.5" />
            Scan Document
          </>
        )}
      </button>
    </div>
  );
};

export default OCRButton;