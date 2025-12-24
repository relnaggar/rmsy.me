import PullToRefresh from "./lib/pulltorefresh.esm.js";

import { addCaca, listCacas } from "./db.js";


// initialize pull to refresh
PullToRefresh.init({
    mainElement: "body",
    onRefresh() {
      location.reload();
    }
  });

// on page load
document.addEventListener("DOMContentLoaded", async () => {
  const id = await addCaca();
  const cacas = await listCacas();

  const el = document.getElementById("status");
  if (el) el.textContent = `Added caca ${id}. Total cacas: ${cacas.length}. Cacas: ${JSON.stringify(cacas)}`;
});

// register service worker if supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
