import { Dexie } from "./lib/dexie.min.mjs";


const db = new Dexie("cacana-db");

db.version(1).stores({ // change version number when changing db schema e.g. adding stores or indexes
  cacas: "uuid, createdAt, deleted, updatedAt",
  outbox: "++localId, uuid, table, entityUuid, timestamp, action", // for pending operations to sync
});

function generateUuid() {
  return crypto.randomUUID();
}

export async function addCaca() {
  const cacaUuid = generateUuid();
  const now = Date.now();
  console.log("Adding caca...");
  await db.table("cacas").put({ // idempotent upsert
    uuid: cacaUuid,
    createdAt: now,
    deleted: false,
    updatedAt: now,
  });
  console.log("Caca added locally");
  await db.table("outbox").add({ // queue for sync
    uuid: generateUuid(),
    table: "cacas",
    entityUuid: cacaUuid,
    timestamp: now,
    action: "create",
  });
  console.log("Caca queued for sync.");
}

export async function getAllCacasNewestFirst() {
  console.log("Getting all cacas...");
  const cacas = await db.table("cacas").orderBy("createdAt").reverse().toArray();
  console.log("Cacas retrieved.");
  return cacas;
}

export async function sync() {
  console.log("Collecting cacas to push...");
  const outbox = await db.table("outbox").orderBy("timestamp").limit(50).toArray();
  console.log("Cacas to push:", outbox);

  console.log("Syncing...");
  const response = await fetch("/cacana/sync.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ outbox }),
  });
  console.log("Sync response received.");

  const responseData = await response.json();
  if (responseData.success) {
    console.log("Sync successful.");

    if (outbox.length > 0) {
      console.log("Clearing pushed cacas...");
      await db.table("outbox").bulkDelete(outbox.map(item => item.localId));
      console.log("Pushed cacas cleared.");
    }
  }
}
