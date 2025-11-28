export interface ImageState {
  file: File | null;
  previewUrl: string | null; // For display (data:image...)
  base64Data: string | null; // Raw base64 for API
  mimeType: string | null;
}

export enum EditorStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface EditHistoryItem {
  id: string;
  originalUrl: string;
  generatedUrl: string;
  prompt: string;
  timestamp: number;
}
