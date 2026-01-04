import PullToRefresh from "./lib/pulltorefresh.min.mjs";

import { isLoggedIn } from "./auth.js";
import {
  initialiseCacana,
  showCacana,
  isCacanaShown,
  onCacanaOnline,
  onCacanaOffline
} from "./cacana.js";
import { initialiseLoginForm, showLoginForm } from "./login.js";
import { initialiseRegisterForm } from "./register.js";


// initialize pull to refresh
PullToRefresh.init({
  onRefresh: () => {
    document.location.reload();
  },
});

// on document ready
document.addEventListener("DOMContentLoaded", async () => {
  initialiseCacana();
  initialiseLoginForm();
  initialiseRegisterForm();

  const loggedIn = await isLoggedIn(
    (err) => console.error("Error checking login status:", err) // TODO
  );
  if (loggedIn) {
    showCacana();
  } else {
    showLoginForm();
  }
});

// on coming online
window.addEventListener("online", () => {
  if (isCacanaShown()) {
    onCacanaOnline();
  }
});

// on going offline
window.addEventListener("offline", () => {
  if (isCacanaShown()) {
    onCacanaOffline();
  }
});

// register service worker if supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
