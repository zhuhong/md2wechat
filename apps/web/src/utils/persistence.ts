const DB_NAME = 'md2wechat';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const KEY_CURRENT = 'current';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export interface Draft {
  content: string;
  filename: string;
  updatedAt: number;
}

export async function saveDraft(draft: Draft): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.put(draft, KEY_CURRENT);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}

export async function loadDraft(): Promise<Draft | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.get(KEY_CURRENT);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve((req.result as Draft | undefined) ?? null);
  });
}

export async function clearDraft(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.delete(KEY_CURRENT);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve();
  });
}
