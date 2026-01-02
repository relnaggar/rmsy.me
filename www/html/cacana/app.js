import PullToRefresh from "./lib/pulltorefresh.min.mjs";

import { addCaca, getAllCacasNewestFirst, sync } from "./database.js";


// initialize pull to refresh
PullToRefresh.init({
  mainElement: "body",
  onRefresh() {
    location.reload();
  }
});

async function renderCacaList() {
  // show loading spinner
  const loading = document.getElementById("loadingCacaList");
  if (loading) {
    loading.style.display = "block";
  }

  // update caca list in DOM to match IndexedDB
  const cacas = await getAllCacasNewestFirst();
  const el = document.getElementById("cacaList");
  if (el) {
    // go through both cacas and el.children in parallel
    for (let i = 0; i < Math.max(cacas.length, el.children.length); i++) {
      const caca = cacas[i];
      const li = el.children[i];

      // if caca exists and li does not, or they don't match, add/update li
      if (caca && (!li || caca.uuid !== li.dataset.uuid)) {
        const newLi = document.createElement("li");
        newLi.dataset.uuid = caca.uuid;
        // format date as YYYY-MM-DD HH:MM:SS
        const createdAt = new Date(caca.createdAt);
        newLi.textContent = createdAt.getFullYear() + "-" +
          String(createdAt.getMonth() + 1).padStart(2, "0") + "-" +
          String(createdAt.getDate()).padStart(2, "0") + " " +
          String(createdAt.getHours()).padStart(2, "0") + ":" +
          String(createdAt.getMinutes()).padStart(2, "0") + ":" +
          String(createdAt.getSeconds()).padStart(2, "0");

        if (li && li.id !== "loadingCacaList") {
          el.insertBefore(newLi, li);
        } else {
          el.appendChild(newLi);
        }
      // if caca does not exist but li does, remove li
      } else if (!caca && li && li.id !== "loadingCacaList") {
        el.removeChild(li);
      }
    };
  }

  // hide loading spinner
  if (loading) {
    loading.style.display = "none";
  }
}

async function addCacaButtonClicked() {
  await addCaca();
  renderCacaList();

  if (navigator.onLine) {
    cacasUpdated = await sync();
    if (cacasUpdated) {
      renderCacaList();
    }
  }
}

// on document ready
document.addEventListener("DOMContentLoaded", async () => {
  if (navigator.onLine) {
    await sync();
  }
  renderCacaList();

  // add event listener for addCacaButton
  const addCacaButton = document.getElementById("addCacaButton");
  if (addCacaButton) {
    addCacaButton.addEventListener("click", addCacaButtonClicked);
  }
});

// on coming online
window.addEventListener("online", async () => {
  cacasUpdated = await sync();
  if (cacasUpdated) {
    renderCacaList();
  }
});

// register service worker if supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
