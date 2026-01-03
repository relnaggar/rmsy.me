import PullToRefresh from "./lib/pulltorefresh.min.mjs";

import { addCaca, getAllCacasNewestFirst, sync } from "./database.js";


let loadingCount = 0;

const formatDateTime = (ms) => {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const renderCacaListItem = (caca) => {
  const li = document.createElement("li");
  li.textContent = formatDateTime(caca.createdAt);
  return li;
}

const renderCacaList = (cacas) => {
  const cacaList = document.getElementById("cacaList");
  if (!cacaList) {
    return;
  }

  const frag = document.createDocumentFragment();
  for (const caca of cacas) {
    frag.appendChild(renderCacaListItem(caca));
  }
  cacaList.replaceChildren(frag);
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

const setIsLoading = (isLoading) => {
  const loadingSpinner = document.getElementById("loadingSpinner");
  if (!loadingSpinner) {
    return;
  }
  loadingSpinner.style.display = isLoading ? "block" : "none";
}

const withLoading = async (fn) => {
  loadingCount++;
  setIsLoading(true);
  try {
    return await fn();
  }
  finally {
    loadingCount--;
    if (loadingCount <= 0) {
      setIsLoading(false);
    }
  }
}

PullToRefresh.init({
  onRefresh: () => withLoading(() => syncAndRender(false)),
});

const addCacaButtonClicked = () => {
  withLoading(async () => {
    await addCaca();
    await syncAndRender(true);
  });
}

// on document ready
document.addEventListener("DOMContentLoaded", () => {
  withLoading(() => syncAndRender(true));

  // add event listener for addCacaButton
  const addCacaButton = document.getElementById("addCacaButton");
  if (addCacaButton) {
    addCacaButton.addEventListener("click", addCacaButtonClicked);
  }
});

// on coming online
window.addEventListener("online", () => {
  withLoading(() => syncAndRender(false));
});

// register service worker if supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
