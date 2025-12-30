import PullToRefresh from "./lib/pulltorefresh.min.mjs";

import { addCaca, listCacasNewestFirst } from "./db.js";


// initialize pull to refresh
PullToRefresh.init({
  mainElement: "body",
  onRefresh() {
    location.reload();
  }
});

// on page load
document.addEventListener("DOMContentLoaded", async () => {
  await addCaca();
  const cacas = await listCacasNewestFirst();
  console.log("cacas:", cacas);

  const el = document.getElementById("status");
  if (el) el.innerHTML = `
<p>Added caca.</p>
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
});

// register service worker if supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
