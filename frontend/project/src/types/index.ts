export type DocumentType = 'passport' | 'identity';

export interface OCRResult {
  text: string;
  confidence: number;
  processingTimeMs: number;
}

export interface UploadState {
  file: File | null;
  preview: string | null;
  loading: boolean;
  error: string | null;
}