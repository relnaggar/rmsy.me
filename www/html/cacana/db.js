import { Dexie } from "./lib/dexie.min.mjs";


const db = new Dexie("cacana-db");

db.version(1).stores({ // change version number when changing db schema e.g. adding stores or indexes
  cacas: "id, createdAt",
});

function uuid() {
  return crypto.randomUUID();
}

export async function addCaca() {
  console.log("Adding caca...");
  await db.table("cacas").add({ id: uuid(), createdAt: Date.now() });
  console.log("Caca added.");
}

export async function listCacasNewestFirst() {
  console.log("Listing cacas...");
  const cacas = await db.table("cacas").orderBy("createdAt").reverse().toArray();
  console.log("Cacas listed.");
  return cacas;
}
