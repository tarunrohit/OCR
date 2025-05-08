import React from 'react';
import { useOCR } from './hooks/useOCR';
import DocumentSelector from './components/DocumentSelector';
import OCRUploader from './components/OCRUploader';
import OCRButton from './components/OCRButton';
import ResultsDisplay from './components/ResultsDisplay';
// MODIFIED IMPORT LINE:
import { ScanLine, Loader2, XCircle } from 'lucide-react'; // Added Loader2 and XCircle

function App() {
  const {
    documentType,
    uploadState,
    result,
    handleDocumentTypeChange,
    handleFileUpload,
    clearUpload,
    processImage,
  } = useOCR();

  return (
    <div className="min-h-screen pb-16 relative selection:bg-purple-500 selection:text-white">
      <div className="absolute inset-0 bg-gradient opacity-90 z-0"></div>
      
      <header className="relative glass-effect shadow-lg py-4 px-6 mb-8 z-10">
        <div className="max-w-5xl mx-auto flex items-center">
          <ScanLine className="h-8 w-8 text-indigo-500 mr-3" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
            Universal Document Scanner
          </h1>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 z-10">
        <div className="glass-effect rounded-xl shadow-2xl p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600 mb-6 pb-2 border-b-2 border-indigo-200">
            Scan Your Document
          </h2>

          <DocumentSelector
            activeDocument={documentType}
            onSelect={handleDocumentTypeChange}
          />

          <OCRUploader
            uploadState={uploadState}
            onFileUpload={handleFileUpload}
            onClear={clearUpload}
          />

          {/* Error display moved from OCRUploader to here for broader scope errors */}
          {uploadState.error && !uploadState.loading && !result && (
            <p className="text-center text-red-600 my-4 p-3 bg-red-100/70 border border-red-300 rounded-md animate-fadeIn">
              {uploadState.error}
            </p>
          )}


          <OCRButton
            onClick={processImage}
            isLoading={uploadState.loading}
            disabled={!uploadState.file || uploadState.loading || !documentType}
          />
        </div>

        {uploadState.loading && (
           <div className="text-center my-8 p-6 glass-effect rounded-xl shadow-xl animate-fadeIn"> {/* Added animate-fadeIn */}
             <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto" />
             <p className="mt-3 text-indigo-700 font-semibold">Processing image, please wait...</p>
           </div>
        )}

        {/* This block is now covered by the error display above if !result */}
        {/* You might refine this if you want specific API errors vs pre-API errors styled differently */}
        {/* {!uploadState.loading && uploadState.error && !result && (
            <div className="glass-effect rounded-xl shadow-xl p-6 mb-8 animate-fadeIn text-center">
                 <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold text-red-700 mb-2">Processing Error</h3>
                <p className="text-red-600 bg-red-100/70 p-3 rounded-md">{uploadState.error}</p>
            </div>
        )} */}
        
        {!uploadState.loading && result && uploadState.preview && (
          <div className="glass-effect rounded-xl shadow-2xl p-6 sm:p-8 mb-8">
            <ResultsDisplay imageUrl={uploadState.preview} result={result} />
          </div>
        )}


        <div className="glass-effect rounded-xl shadow-xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-indigo-900 mb-4">
            About This Document Scanner
          </h2>
          <p className="text-indigo-900/85 mb-4 text-sm sm:text-base leading-relaxed">
            This application allows you to quickly extract text from various identity documents like Passports, PAN cards, and Aadhaar cards. 
            Simply select the document type, upload a clear image of your document, and click the scan button to get started.
          </p>
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 text-sm text-indigo-800 border border-indigo-200/80 shadow">
            <strong>Disclaimer:</strong> This is a demonstration application. 
            The OCR (Optical Character Recognition) process simulates real-world extraction using the provided image. 
            For production systems, ensure robust error handling, security, and privacy measures are in place. Always handle personal data responsibly.
          </div>
        </div>
      </main>

      <footer className="relative text-center py-6 mt-12 z-10">
        <p className="text-sm text-white/80">© {new Date().getFullYear()} Document Scanner App. For demo purposes.</p>
      </footer>
    </div>
  );
}

export default App;