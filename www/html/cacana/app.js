import PullToRefresh from "./lib/pulltorefresh.min.mjs";

import {
  addCaca as dbAddCaca,
  getAllCacasNewestFirst,
  sync,
} from "./database.js";

// initialize pull to refresh
PullToRefresh.init({
  mainElement: "body",
  onRefresh() {
    location.reload();
  }
});

async function refreshCacas() {
  const cacas = await getAllCacasNewestFirst();
  console.log("cacas:", cacas);

  const el = document.getElementById("cacaList");
  if (el) el.innerHTML = `
<p>
  Cacas:
  <ul>
    ${cacas.map(c => `
      <li>
        ${new Date(c.createdAt).toLocaleString()}
      </li>
    `).join("\n")}
  </ul>
  Total cacas: ${cacas.length}.
</p>
  `;
}

async function addCaca() {
  await dbAddCaca();
  refreshCacas();

  if (navigator.onLine) {
    await sync();
    refreshCacas();
  }
}

// on document ready
document.addEventListener("DOMContentLoaded", async () => {
  if (navigator.onLine) {
    await sync();
  }
  refreshCacas();

  // add event listener for addCacaButton
  const addCacaButton = document.getElementById("addCacaButton");
  if (addCacaButton) {
    addCacaButton.addEventListener("click", addCaca);
  }
});

// on coming online
window.addEventListener("online", async () => {
  await sync();
  refreshCacas();
});

// register service worker if supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
