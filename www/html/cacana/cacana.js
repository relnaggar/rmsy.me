import {
  addCaca,
  getAllCacasNewestFirst,
  sync,
  deleteCaca,
  clearLocalData
} from "./database.js";
import { logout } from "./auth.js";
import { showLoginForm } from "./login.js";


let loadingCount = 0;

const formatDateTime = (ms) => {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const clickDeleteCacaButton = (cacaUuid) => {
  withSyncStatus(async () => {
    await deleteCaca(cacaUuid);
    await syncAndRenderCacana(true);
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
  const fragment = document.createDocumentFragment();
  for (const caca of cacas) {
    if (caca.deletedAt !== null) {
      continue;
    }
    fragment.appendChild(renderCacaListItem(caca));
  }
  document.getElementById("cacaList").replaceChildren(fragment);
}

const onLoggedOut = async () => {
  await clearLocalData();
  showLoginForm();
}

const syncAndRenderCacana = async (alwaysRender) => {
  let cacasUpdated = false;
  if (navigator.onLine) {
    cacasUpdated = await sync(onLoggedOut);
  }
  if (alwaysRender || cacasUpdated) {
    const cacas = await getAllCacasNewestFirst();
    renderCacaList(cacas);
  }
}

const setSyncStatus = (syncStatus) => {
  const syncButton = document.getElementById("syncButton");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const syncButtonText = document.getElementById("syncButtonText");

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

const clickSyncButton = () => {
  withSyncStatus(() => syncAndRenderCacana(true));
}

const clickAddCacaButton = () => {
  withSyncStatus(async () => {
    await addCaca();
    await syncAndRenderCacana(true);
  });
}

const clickLogoutButton = async () => {
  await logout(onLoggedOut);
}

export const initialiseCacana = () => {
  document.getElementById("syncButton")
    .addEventListener("click", clickSyncButton);
  document.getElementById("addCacaButton")
    .addEventListener("click", clickAddCacaButton);
  document.getElementById("logoutButton")
    .addEventListener("click", clickLogoutButton);
}

export const showCacana = async () => {
  document.getElementById("authContent").classList.add("d-none");
  document.getElementById("appContent").classList.remove("d-none");
  clickSyncButton();
}

export const isCacanaShown = () => {
  return !(document.getElementById("appContent").classList.contains("d-none"));
}

export const onCacanaOnline = () => {
  withSyncStatus(() => syncAndRenderCacana(false));
}

export const onCacanaOffline = () => {
  setSyncStatus("offline");
}
