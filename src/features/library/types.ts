export type DocumentType = 'resume' | 'cover-letter' | 'other';
export interface CareerDocument {
  id: string; name: string; type: DocumentType; fileName: string; mimeType: string;
  sizeBytes: number; isDefault: boolean; targetRole?: string; createdAt: number; updatedAt: number;
}
export interface SavedAnswer {
  id: string; title: string; answer: string; category?: string; keywords: string[]; createdAt: number; updatedAt: number;
}
export interface MessageSnippet {
  id: string; title: string; body: string; category?: string; maxLength?: number; createdAt: number; updatedAt: number;
}
