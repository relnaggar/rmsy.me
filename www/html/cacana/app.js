import PullToRefresh from "./lib/pulltorefresh.min.mjs";

import {
  addCaca,
  getAllCacasNewestFirst,
  sync,
  deleteCaca
} from "./database.js";


let loadingCount = 0;

const formatDateTime = (ms) => {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const clickDeleteCacaButton = async (cacaUuid) => {
  withSyncStatus(async () => {
    await deleteCaca(cacaUuid);
    await syncAndRender(true);
  });
}

const renderCacaListItem = (caca) => {
  const fragment = document.createDocumentFragment();
  const li = document.createElement("li");
  fragment.appendChild(li);
  const span = document.createElement("span");
  li.appendChild(span);
  span.textContent = formatDateTime(caca.createdAt);
  const button = document.createElement("button");
  button.className = "btn btn-sm btn-danger ms-2";
  li.appendChild(button);
  button.textContent = "Delete";
  button.addEventListener("click", () => clickDeleteCacaButton(caca.uuid));
  return li;
}

const renderCacaList = (cacas) => {
  const cacaList = document.getElementById("cacaList");
  if (!cacaList) {
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const caca of cacas) {
    if (caca.deletedAt !== null) {
      continue;
    }
    fragment.appendChild(renderCacaListItem(caca));
  }
  cacaList.replaceChildren(fragment);
}

const syncAndRender = async (alwaysRender) => {
  let cacasUpdated = false;
  if (navigator.onLine) {
    cacasUpdated = await sync();
  }
  if (alwaysRender || cacasUpdated) {
    const cacas = await getAllCacasNewestFirst();
    renderCacaList(cacas);
  }
}

const setSyncStatus = (syncStatus) => {
  const syncButton = document.getElementById("syncButton");
  if (!syncButton) {
    return;
  }
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (!loadingSpinner) {
    return;
  }
  const syncButtonText = document.getElementById("syncButtonText");
  if (!syncButtonText) {
    return;
  }

  if (syncStatus === "syncing") {
    syncButton.disabled = true;

    loadingSpinner.className = "spinner-border spinner-border-sm";
    loadingSpinner.setAttribute("aria-hidden", "true");

    syncButtonText.className = "";
    syncButtonText.textContent = "Syncing...";
  } else if (syncStatus === "online") {
    syncButton.disabled = false;

    loadingSpinner.className = "";
    loadingSpinner.removeAttribute("aria-hidden");

    syncButtonText.className = "mx-4";
    syncButtonText.textContent = "Synced";
  } else if (syncStatus === "offline") {
    syncButton.disabled = true;

    loadingSpinner.className = "";
    loadingSpinner.removeAttribute("aria-hidden");

    syncButtonText.className = "mx-3";
    syncButtonText.textContent = "Offline";
  }
}

const withSyncStatus = async (fn) => {
  loadingCount++;
  setSyncStatus("syncing");
  try {
    return await fn();
  }
  finally {
    loadingCount--;
    if (loadingCount <= 0) {
      setSyncStatus(navigator.onLine ? "online" : "offline");
    }
  }
}

PullToRefresh.init({
  onRefresh: () => withSyncStatus(() => syncAndRender(false)),
});

const clickAddCacaButton = () => {
  withSyncStatus(async () => {
    await addCaca();
    await syncAndRender(true);
  });
}

// on document ready
document.addEventListener("DOMContentLoaded", () => {
  withSyncStatus(() => syncAndRender(true));

  // add event listener for syncButton
  const syncButton = document.getElementById("syncButton");
  if (syncButton) {
    syncButton.addEventListener("click", () => {
      withSyncStatus(() => syncAndRender(true));
    });
  }

  // add event listener for addCacaButton
  const addCacaButton = document.getElementById("addCacaButton");
  if (addCacaButton) {
    addCacaButton.addEventListener("click", clickAddCacaButton);
  }
});

// on coming online
window.addEventListener("online", () => {
  withSyncStatus(() => syncAndRender(false));
});

// on going offline
window.addEventListener("offline", () => {
  setSyncStatus("offline");
});

// register service worker if supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
