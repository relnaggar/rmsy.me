import { addCaca, listCacas } from "./db.js";

document.addEventListener("DOMContentLoaded", async () => {
  const id = await addCaca();
  const cacas = await listCacas();

  const el = document.getElementById("status");
  if (el) el.textContent = `Added caca ${id}. Total cacas: ${cacas.length}. Cacas: ${JSON.stringify(cacas)}`;
});

// register service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
