import type { CareerDocument, DocumentType, MessageSnippet, SavedAnswer } from './types';
const DB_NAME = 'career-pilot-local';
const DB_VERSION = 1;
const DOCS = 'documents';
const BLOBS = 'documentBlobs';
const ANSWERS = 'savedAnswers';
const SNIPPETS = 'messageSnippets';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DOCS)) db.createObjectStore(DOCS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(BLOBS)) db.createObjectStore(BLOBS);
      if (!db.objectStoreNames.contains(ANSWERS)) db.createObjectStore(ANSWERS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(SNIPPETS)) db.createObjectStore(SNIPPETS, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function withStore<T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  try { return await requestResult(action(db.transaction(storeName, mode).objectStore(storeName))); }
  finally { db.close(); }
}
export async function listDocuments(): Promise<CareerDocument[]> {
  return (await withStore(DOCS, 'readonly', store => store.getAll())).sort((a, b) => b.updatedAt - a.updatedAt);
}
export async function addDocument(file: File, type: DocumentType, targetRole?: string): Promise<CareerDocument> {
  if (!file.size) throw new Error('The selected file is empty.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Files must be 5 MB or smaller.');
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowed.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) throw new Error('Choose a PDF, DOC, or DOCX file.');
  const id = crypto.randomUUID(), now = Date.now();
  const document: CareerDocument = { id, name: file.name.replace(/\.[^.]+$/, ''), type, fileName: file.name, mimeType: file.type || 'application/octet-stream', sizeBytes: file.size, isDefault: false, targetRole, createdAt: now, updatedAt: now };
  const db = await openDatabase();
  try {
    const tx = db.transaction([DOCS, BLOBS], 'readwrite');
    tx.objectStore(DOCS).put(document);
    tx.objectStore(BLOBS).put(file, id);
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });
  } finally { db.close(); }
  return document;
}
export async function getDocumentBlob(id: string): Promise<Blob | undefined> {
  return withStore(BLOBS, 'readonly', store => store.get(id));
}
export async function setDefaultDocument(id: string, type: DocumentType): Promise<void> {
  const docs = await listDocuments();
  const db = await openDatabase();
  try {
    const tx = db.transaction(DOCS, 'readwrite'), store = tx.objectStore(DOCS);
    docs.filter(d => d.type === type).forEach(d => store.put({ ...d, isDefault: d.id === id, updatedAt: Date.now() }));
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  } finally { db.close(); }
}
export async function deleteDocument(id: string): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction([DOCS, BLOBS], 'readwrite');
    tx.objectStore(DOCS).delete(id); tx.objectStore(BLOBS).delete(id);
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  } finally { db.close(); }
}
export async function listAnswers(): Promise<SavedAnswer[]> { return withStore(ANSWERS, 'readonly', store => store.getAll()); }
export async function saveAnswer(item: SavedAnswer): Promise<void> { await withStore(ANSWERS, 'readwrite', store => store.put(item)); }
export async function deleteAnswer(id: string): Promise<void> { await withStore(ANSWERS, 'readwrite', store => store.delete(id)); }
export async function listSnippets(): Promise<MessageSnippet[]> { return withStore(SNIPPETS, 'readonly', store => store.getAll()); }
export async function saveSnippet(item: MessageSnippet): Promise<void> { await withStore(SNIPPETS, 'readwrite', store => store.put(item)); }
export async function deleteSnippet(id: string): Promise<void> { await withStore(SNIPPETS, 'readwrite', store => store.delete(id)); }
export async function clearLibrary(): Promise<void> {
  const db = await openDatabase();
  try {
    const tx = db.transaction([DOCS, BLOBS, ANSWERS, SNIPPETS], 'readwrite');
    [DOCS, BLOBS, ANSWERS, SNIPPETS].forEach(name => tx.objectStore(name).clear());
    await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  } finally { db.close(); }
}
