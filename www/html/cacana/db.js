const DB_NAME = "cacana-db";
const DB_VERSION = 1;
const OBJECT_STORE = "cacana-store";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // called if DB_VERSION is higher than existing version
    request.onupgradeneeded = () => {
      const db = request.result;

      // create a store with auto-incrementing primary key
      if (!db.objectStoreNames.contains(OBJECT_STORE)) {
        const store = db.createObjectStore(OBJECT_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });

        // create index on createdAt field
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addCaca() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OBJECT_STORE, "readwrite");
    const store = transaction.objectStore(OBJECT_STORE);

    const caca = { createdAt: Date.now() };
    const request = store.add(caca);

    request.onsuccess = () => resolve(request.result); // return the generated id
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function listCacas() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OBJECT_STORE, "readonly");
    const store = transaction.objectStore(OBJECT_STORE);
    const index = store.index("createdAt");

    const cacas = [];
    const request = index.openCursor(null, "prev"); // newest first

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cacas.push(cursor.value);
        cursor.continue();
      } else {
        resolve(cacas);
      }
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}
