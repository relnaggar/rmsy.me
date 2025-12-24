import { Dexie } from "./lib/dexie.mjs";

export const db = new Dexie("cacana-db");

db.version(1).stores({ // change version number when changing db schema e.g. adding stores or indexes
  "cacana-store": "++id, createdAt", // auto-increment primary key, index on createdAt
});

const STORE = "cacana-store";

export async function addCaca() {
  return db.table(STORE).add({ createdAt: Date.now() }); // returns generated id
}

export async function listCacas() {
  // newest first
  return db.table(STORE).orderBy("createdAt").reverse().toArray();
}
