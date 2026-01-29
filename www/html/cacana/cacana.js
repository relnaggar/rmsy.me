import {
  addCaca,
  getAllCacasNewestFirst,
  sync,
  deleteCaca,
  getUserColour,
  setUserColour,
  getAuthUsername,
} from "./database.js";
import { logout } from "./auth.js";
import { showLoginForm } from "./login.js";
import { updateServiceWorker } from "./app.js";


let loadingCount = 0;
let historicCaca = false;

const formatDateTime = (ms) => {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const clickDeleteCacaButton = (cacaUuid) => {
  withSyncStatus(async () => {
    await deleteCaca(cacaUuid);
    await syncAndRenderCacana(true);
  });
}

const renderCacaTableRow = (caca, userColour) => {
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
  td2.style.backgroundColor = userColour;
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

const renderCacaTable = (cacas, userColour) => {
  const fragment = document.createDocumentFragment();
  for (const caca of cacas) {
    if (caca.deletedAt !== null) {
      continue;
    }
    fragment.appendChild(renderCacaTableRow(caca, userColour));
  }
  document.getElementById("cacaTableBody").replaceChildren(fragment);
}

const onLoggedOut = async () => {
  showLoginForm();
}

const renderUserColourSetting = async (userColour) => {
  document.getElementById("userColourInput").value = userColour;
}

const syncAndRenderCacana = async () => {
  if (navigator.onLine) {
    await sync(onLoggedOut);
  }
  const cacas = await getAllCacasNewestFirst();
  const userColour = await getUserColour();
  renderCacaTable(cacas, userColour);
  renderUserColourSetting(userColour);
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
  withSyncStatus(() => syncAndRenderCacana());
}

const clickRefreshButton = async () => {
  updateServiceWorker();
  window.location.reload();
}

const clickToggleHistoricCacaButton = () => {
  historicCaca = !historicCaca;
  const container = document.getElementById("customDateContainer");
  const historicCacaButton = document.getElementById("toggleHistoricCacaButton");
  const addCacaButton = document.getElementById("addCacaButton");
  const icon = historicCacaButton.querySelector("i");
  if (historicCaca) {
    container.classList.remove("d-none");
    icon.className = "bi bi-calendar2-x";
    addCacaButton.textContent = "Add Caca (Historic)";
  } else {
    container.classList.add("d-none");
    icon.className = "bi bi-calendar2-date";
    addCacaButton.textContent = "Add Caca (Now)";
  }
}

const clickAddCacaButton = () => {
  withSyncStatus(async () => {
    const input = document.getElementById("customDateInput");
    const useCustomDate = historicCaca && input.value;
    if (useCustomDate) {
      const createdAt = new Date(input.value).getTime();
      await addCaca(createdAt);
    } else {
      await addCaca();
    }
    await syncAndRenderCacana();
  });
}

const clickLogoutButton = async () => {
  await logout(onLoggedOut, (err) => {
    console.error("Error during logout:", err); // TODO handle error properly
  });
}

const clickHomeButton = () => {
  document.getElementById("homeContainer").classList.remove("d-none");
  document.getElementById("homeButton").classList.add("active");
  document.getElementById("homeButton").setAttribute("aria-current", "page");
  document.getElementById("statsContainer").classList.add("d-none");
  document.getElementById("statsButton").classList.remove("active");
  document.getElementById("statsButton").removeAttribute("aria-current");
  document.getElementById("settingsContainer").classList.add("d-none");
  document.getElementById("settingsButton").classList.remove("active");
  document.getElementById("settingsButton").removeAttribute("aria-current");
}

const clickStatsButton = () => {
  document.getElementById("homeContainer").classList.add("d-none");
  document.getElementById("homeButton").classList.remove("active");
  document.getElementById("homeButton").removeAttribute("aria-current");
  document.getElementById("statsContainer").classList.remove("d-none");
  document.getElementById("statsButton").classList.add("active");
  document.getElementById("statsButton").setAttribute("aria-current", "page");
  document.getElementById("settingsContainer").classList.add("d-none");
  document.getElementById("settingsButton").classList.remove("active");
  document.getElementById("settingsButton").removeAttribute("aria-current");
}

const clickSettingsButton = () => {
  document.getElementById("homeContainer").classList.add("d-none");
  document.getElementById("homeButton").classList.remove("active");
  document.getElementById("homeButton").removeAttribute("aria-current");
  document.getElementById("statsContainer").classList.add("d-none");
  document.getElementById("statsButton").classList.remove("active");
  document.getElementById("statsButton").removeAttribute("aria-current");
  document.getElementById("settingsContainer").classList.remove("d-none");
  document.getElementById("settingsButton").classList.add("active");
  document.getElementById("settingsButton").setAttribute("aria-current", "page");
}

const initialiseHomePage = () => {
  document.getElementById("addCacaButton")
    .addEventListener("click", clickAddCacaButton);
  document.getElementById("toggleHistoricCacaButton")
    .addEventListener("click", clickToggleHistoricCacaButton);
}

const initialiseStatsPage = () => {
}

const initialiseSettingsPage = () => {
  document.getElementById("userColourInput")
    .addEventListener("change", async (event) => {
      const colour = event.target.value;
      await setUserColour(colour);
      clickSyncButton();
    });
  document.getElementById("appVersion").textContent = "v" + VERSION_NUMBER;
}

export const initialiseCacana = () => {
  document.getElementById("logoutButton")
    .addEventListener("click", clickLogoutButton);
  document.getElementById("syncButton")
    .addEventListener("click", clickSyncButton);
  Array.from(document.getElementsByClassName("refreshButton")).forEach(
    button => {
      button.addEventListener("click", clickRefreshButton);
      button.addEventListener("keypress", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          clickRefreshButton();
        }
      });
    }
  );
  document.getElementById("homeButton")
    .addEventListener("click", clickHomeButton);
  document.getElementById("statsButton")
    .addEventListener("click", clickStatsButton);
  document.getElementById("settingsButton")
    .addEventListener("click", clickSettingsButton);
  initialiseHomePage();
  initialiseStatsPage();
  initialiseSettingsPage();
  clickHomeButton();
}

export const showCacana = async () => {
  document.getElementById("authContent").classList.add("d-none");
  document.getElementById("appContent").classList.remove("d-none");
  clickSyncButton();
  const authUsername = await getAuthUsername();
  document.getElementById("authUsername").textContent = authUsername;
  if (navigator.onLine) {
    enableLogoutButton();
  }
}

export const isCacanaShown = () => {
  return !(document.getElementById("appContent").classList.contains("d-none"));
}

const disableLogoutButton = () => {
  const logoutButton = document.getElementById("logoutButton");
  logoutButton.disabled = true;
}

const enableLogoutButton = () => {
  const logoutButton = document.getElementById("logoutButton");
  logoutButton.disabled = false;
}

export const onCacanaOnline = () => {
  clickSyncButton();
  enableLogoutButton();
}

export const onCacanaOffline = () => {
  setSyncStatus("offline");
  disableLogoutButton();
}
