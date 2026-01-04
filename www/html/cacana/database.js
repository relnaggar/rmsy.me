import { Dexie } from "./lib/dexie.min.mjs";


const db = new Dexie("cacana-db");

db.version(1).stores({ // change version number when changing db schema e.g. adding stores or indexes
  cacas: "uuid, createdAt, deletedAt, updatedAt",
  outbox: "++localId, uuid, table, entityUuid, timestamp, action", // for pending operations to sync
  meta: "key, value", // for storing latest sync timestamp etc.
});

function generateUuid() {
  return crypto.randomUUID();
}

export async function addCaca() {
  const cacaUuid = generateUuid();
  const now = Date.now();

   // idempotent upsert
  console.log("Adding caca...");
  await db.table("cacas").put({
    uuid: cacaUuid,
    createdAt: now,
    deletedAt: null,
    updatedAt: now,
  });
  console.log("Caca added locally");

  // queue for sync
  await db.table("outbox").add({
    uuid: generateUuid(),
    table: "cacas",
    entityUuid: cacaUuid,
    timestamp: now,
    action: "create",
  });
  console.log("Caca creation queued for sync.");
}

export async function getAllCacasNewestFirst() {
  console.log("Getting all cacas...");
  const cacas = await db.table("cacas").orderBy("createdAt").reverse().toArray();
  console.log("Cacas retrieved.");
  return cacas;
}

export async function sync(onUnauthorised) {
  let cacasUpdated = false;
  console.log("Collecting cacas to push...");
  const outbox = await db.table("outbox").orderBy("timestamp").toArray();
  console.log("Cacas to push:", outbox);

  console.log("Getting latest timestamp...");
  const latestTimestampEntry = await db.table("meta").get("latestTimestamp")
  let latestTimestamp = 0;
  if (latestTimestampEntry) {
    latestTimestamp = latestTimestampEntry.value;
  }

  console.log("Syncing...");
  const response = await fetch("sync.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      outbox,
      latestTimestamp,
    }),
  });
  console.log("Sync response received.");

  if (response.status === 401) {
    onUnauthorised();
    return false;
  }

  const responseData = await response.json();
  if (responseData.success) {
    console.log("Sync successful.");

    if (outbox.length > 0) {
      console.log("Clearing pushed cacas...");
      await db.table("outbox").bulkDelete(outbox.map(item => item.localId));
      console.log("Pushed cacas cleared.");
    }

    for (const caca of responseData.cacas) {
      console.log("Updating/adding caca from server:", caca);
      await db.table("cacas").put({
        uuid: caca.uuid,
        createdAt: caca.createdAt,
        deletedAt: caca.deletedAt,
        updatedAt: caca.updatedAt,
      });
      cacasUpdated = true;
      console.log("Caca updated/added.");
    }

    console.log("Updating latest timestamp...");
    await db.table("meta").put({
      key: "latestTimestamp",
      value: responseData.newLatestTimestamp,
    });
    console.log("Latest timestamp updated.");
  }
  return cacasUpdated;
}

export async function deleteCaca(cacaUuid) {
  const now = Date.now();

  // mark as deleted locally
  console.log("Deleting caca...");
  await db.table("cacas").put({
    uuid: cacaUuid,
    deletedAt: now,
    updatedAt: now,
  });
  console.log("Caca deleted locally.");

  // queue for sync
  await db.table("outbox").add({
    uuid: generateUuid(),
    table: "cacas",
    entityUuid: cacaUuid,
    timestamp: now,
    action: "delete",
  });
  console.log("Caca deletion queued for sync.");
}

export async function clearLocalData() {
  console.log("Clearing local data...");
  await db.table("cacas").clear();
  await db.table("outbox").clear();
  await db.table("meta").clear();
  console.log("Local data cleared.");
}
