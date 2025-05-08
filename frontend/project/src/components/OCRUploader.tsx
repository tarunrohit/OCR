import React, { useRef } from 'react';
import { UploadCloud, FileImage, XCircle, Loader2 } from 'lucide-react';

interface OCRUploaderProps {
  uploadState: {
    file: File | null;
    preview: string | null;
    loading: boolean;
    error: string | null; // Add error here if you want to display it near uploader
  };
  onFileUpload: (file: File | null) => void;
  onClear: () => void;
}

const OCRUploader: React.FC<OCRUploaderProps> = ({ uploadState, onFileUpload, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset file input to allow re-uploading the same file name
    if (event.target) {
        event.target.value = "";
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-indigo-600', 'bg-indigo-50/70');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-600', 'bg-indigo-50/70');
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-indigo-600', 'bg-indigo-50/70');
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
      <p className="text-md font-semibold text-indigo-800 mb-3">
        2. Upload Document Image:
      </p>
      {uploadState.preview && uploadState.file ? (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center relative bg-white/70 shadow-inner">
          <img
            src={uploadState.preview}
            alt="Preview"
            className="max-h-48 w-auto mx-auto rounded-md object-contain mb-3 shadow-sm"
          />
          <p className="text-sm text-gray-700 truncate" title={uploadState.file.name}>
            <FileImage className="inline-block h-5 w-5 mr-2 text-indigo-500" />
            {uploadState.file.name}
          </p>
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            aria-label="Clear image"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center w-full h-48 p-4 border-2 border-indigo-300 border-dashed rounded-xl cursor-pointer bg-indigo-50/50 hover:bg-indigo-100/70 hover:border-indigo-500 transition-colors duration-200"
        >
          <UploadCloud className="h-12 w-12 text-indigo-500 mb-3" strokeWidth={1.5} />
          <span className="text-indigo-700 font-medium">Click to upload or drag & drop</span>
          <span className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (MAX. 5MB)</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
          />
        </label>
      )}
       {uploadState.error && !uploadState.loading && (
        <p className="text-sm text-red-600 mt-2 text-center">{uploadState.error}</p>
      )}
    </div>
  );
};

export default OCRUploader;