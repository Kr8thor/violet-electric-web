/**
 * IndexedDB Failsafe Storage
 * Third layer of protection using browser's IndexedDB
 */

const DB_NAME = 'VioletContentDB';
const DB_VERSION = 1;
const STORE_NAME = 'content';

export class IndexedDBFailsafe {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB initialization failed');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveContent(content: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const data = {
        id: 'violet-content',
        content,
        timestamp: Date.now(),
        version: Date.now()
      };

      const request = store.put(data);

      request.onsuccess = () => {
        console.log('✅ Content saved to IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('IndexedDB save failed');
        reject(request.error);
      };
    });
  }

  async loadContent(): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('violet-content');

      request.onsuccess = () => {
        if (request.result) {
          console.log('✅ Content loaded from IndexedDB');
          resolve(request.result.content);
        } else {
          resolve({});
        }
      };

      request.onerror = () => {
        console.error('IndexedDB load failed');
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('✅ IndexedDB cleared');
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

export const indexedDBFailsafe = new IndexedDBFailsafe();
