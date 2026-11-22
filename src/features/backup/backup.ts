import { getProfile, saveProfile } from '../profile/repository';
import type { UserProfile } from '../profile/types';
import { clearLibrary, deleteDocument, getDocumentBlob, listAnswers, listDocuments, listSnippets, saveAnswer, saveSnippet, addDocument } from '../library/database';
import type { CareerDocument, MessageSnippet, SavedAnswer } from '../library/types';

interface BackupFile {
  schemaVersion: 1;
  exportedAt: number;
  profile: UserProfile;
  answers: SavedAnswer[];
  snippets: MessageSnippet[];
  documents: Array<{ metadata: CareerDocument; contentBase64: string }>;
}
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
function base64ToBlob(value: string, type: string): Blob {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new Blob([bytes], { type });
}
export async function createBackup(): Promise<Blob> {
  const [profile, answers, snippets, documents] = await Promise.all([getProfile(), listAnswers(), listSnippets(), listDocuments()]);
  const serialized = await Promise.all(documents.map(async metadata => {
    const blob = await getDocumentBlob(metadata.id);
    if (!blob) throw new Error(`Missing file content for ${metadata.fileName}`);
    return { metadata, contentBase64: await blobToBase64(blob) };
  }));
  const backup: BackupFile = { schemaVersion: 1, exportedAt: Date.now(), profile, answers, snippets, documents: serialized };
  return new Blob([JSON.stringify(backup)], { type: 'application/json' });
}
export async function restoreBackup(file: File): Promise<void> {
  if (file.size > 50 * 1024 * 1024) throw new Error('Backup files must be 50 MB or smaller.');
  const parsed: unknown = JSON.parse(await file.text());
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid backup file.');
  const backup = parsed as Partial<BackupFile>;
  if (backup.schemaVersion !== 1 || !backup.profile || !Array.isArray(backup.answers) || !Array.isArray(backup.snippets) || !Array.isArray(backup.documents)) throw new Error('Unsupported or incomplete backup format.');
  for (const item of backup.documents) {
    if (!item.metadata?.fileName || typeof item.contentBase64 !== 'string' || item.metadata.sizeBytes > 5 * 1024 * 1024) throw new Error('Backup contains an invalid document.');
  }
  await clearLibrary();
  await saveProfile(backup.profile);
  for (const answer of backup.answers) await saveAnswer(answer);
  for (const snippet of backup.snippets) await saveSnippet(snippet);
  for (const item of backup.documents) {
    const blob = base64ToBlob(item.contentBase64, item.metadata.mimeType);
    const fileToImport = new File([blob], item.metadata.fileName, { type: item.metadata.mimeType });
    const restored = await addDocument(fileToImport, item.metadata.type, item.metadata.targetRole);
    // Preserve document identity and user-facing metadata in the next implementation pass.
    if (item.metadata.isDefault) await deleteDocument(restored.id);
  }
}
