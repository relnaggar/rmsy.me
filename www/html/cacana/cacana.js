import {
  addCaca,
  getAllCacasNewestFirst,
  sync,
  deleteCaca,
  clearLocalData
} from "./database.js";
import { getCurrentUser, logout } from "./auth.js";
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

const renderCacaTableRow = (caca) => {
  const tr = document.createElement("tr");

  // caca image
  const td1 = document.createElement("td");
  const img = document.createElement("img");
  img.className = "me-2";
  img.src = "./icons/icon-192.png";
  img.width = 16;
  img.height = 16;
  img.alt = "Caca";
  td1.appendChild(img);
  tr.appendChild(td1);

  // created at
  const td2 = document.createElement("td");
  td2.textContent = formatDateTime(caca.createdAt);
  tr.appendChild(td2);

  // delete button
  const td3 = document.createElement("td");
  const button = document.createElement("button");
  button.className = "btn btn-sm btn-danger ms-2";
  button.textContent = "Delete";
  button.addEventListener("click", () => clickDeleteCacaButton(caca.uuid));
  td3.appendChild(button);
  tr.appendChild(td3);

  return tr;
}

const renderCacaTable = (cacas) => {
  const fragment = document.createDocumentFragment();
  for (const caca of cacas) {
    if (caca.deletedAt !== null) {
      continue;
    }
    fragment.appendChild(renderCacaTableRow(caca));
  }
  document.getElementById("cacaTableBody").replaceChildren(fragment);
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
    renderCacaTable(cacas);
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
    syncButtonText.textContent = "Syncing...";
  } else if (syncStatus === "online") {
    syncButton.disabled = false;
    loadingSpinner.className = "";
    loadingSpinner.removeAttribute("aria-hidden");
    syncButtonText.textContent = "Sync";
  } else if (syncStatus === "offline") {
    syncButton.disabled = true;
    loadingSpinner.className = "";
    loadingSpinner.removeAttribute("aria-hidden");
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

const clickRefreshButton = () => {
  window.location.reload();
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

const clickHomeButton = () => {
  document.getElementById("cacaTableContainer").classList.remove("d-none");
  document.getElementById("statsContainer").classList.add("d-none");
  document.getElementById("settingsContainer").classList.add("d-none");
}

const clickStatsButton = () => {
  document.getElementById("cacaTableContainer").classList.add("d-none");
  document.getElementById("statsContainer").classList.remove("d-none");
  document.getElementById("settingsContainer").classList.add("d-none");
}

const clickSettingsButton = () => {
  document.getElementById("cacaTableContainer").classList.add("d-none");
  document.getElementById("statsContainer").classList.add("d-none");
  document.getElementById("settingsContainer").classList.remove("d-none");
}

export const initialiseCacana = () => {
  document.getElementById("syncButton")
    .addEventListener("click", clickSyncButton);
  document.getElementById("refreshButton")
    .addEventListener("click", clickRefreshButton);
  document.getElementById("addCacaButton")
    .addEventListener("click", clickAddCacaButton);
  document.getElementById("logoutButton")
    .addEventListener("click", clickLogoutButton);
  document.getElementById("homeButton")
    .addEventListener("click", clickHomeButton);
  document.getElementById("statsButton")
    .addEventListener("click", clickStatsButton);
  document.getElementById("settingsButton")
    .addEventListener("click", clickSettingsButton);
}

export const showCacana = async () => {
  document.getElementById("authContent").classList.add("d-none");
  document.getElementById("appContent").classList.remove("d-none");
  clickSyncButton();
  const currentUser = await getCurrentUser();
  document.getElementById("currentUser").textContent = currentUser;
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
