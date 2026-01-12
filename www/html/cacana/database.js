import { Dexie } from "./lib/dexie.min.mjs";

import { getCurrentUser } from "./auth.js";


const db = new Dexie("cacana-db");

db.version(2).stores({ // change version number when changing db schema e.g. adding stores or indexes
  cacas: "uuid, createdAt, deletedAt, updatedAt",
  outbox: "++localId, uuid, table, entityUuid, timestamp, action", // for pending operations to sync
  meta: "key, value", // latestTimestamp, userColour
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

export async function getUserColour() {
  console.log("Getting user colour...");
  const entry = await db.table("meta").get("userColour");
  console.log("User colour retrieved.");
  return entry ? entry.value : "#000000";
}

export async function setUserColour(colour) {
  console.log("Setting user colour...");
  await db.table("meta").put({
    key: "userColour",
    value: colour,
  });
  console.log("User colour set.");

  // queue for sync
  const now = Date.now();
  await db.table("outbox").add({
    uuid: generateUuid(),
    table: "users",
    entityUuid: await getCurrentUser(),
    timestamp: now,
    action: "updateColour",
    colour: colour,
  });
  console.log("User colour update queued for sync.");
}

export async function sync(onUnauthorised) {
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
      console.log("Clearing outbox...");
      await db.table("outbox").bulkDelete(outbox.map(item => item.localId));
      console.log("Outbox cleared.");
    }

    for (const caca of responseData.cacas) {
      console.log("Updating/adding caca from server:", caca);
      await db.table("cacas").put({
        uuid: caca.uuid,
        createdAt: caca.createdAt,
        deletedAt: caca.deletedAt,
        updatedAt: caca.updatedAt,
      });
      console.log("Caca updated/added.");
    }

    if (responseData.userColour) {
      console.log("Updating user colour...");
      await db.table("meta").put({
        key: "userColour",
        value: responseData.userColour,
      });
      console.log("User colour updated.");
    }

    console.log("Updating latest timestamp...");
    await db.table("meta").put({
      key: "latestTimestamp",
      value: responseData.newLatestTimestamp,
    });
    console.log("Latest timestamp updated.");
  }
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
