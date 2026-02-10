import {
  storeAuth,
  getAuthToken,
  getAuthUsername,
  clearLocalData,
} from "./database.js";


export async function authFetch(url, options = {}) {
  const authToken = await getAuthToken();
  const headers = new Headers(options.headers || {});
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  return fetch(url, { ...options, headers });
}

export async function isLoggedIn() {
  const authUsername = await getAuthUsername();
  const authToken = await getAuthToken();

  if (!authUsername || !authToken) {
    return false;
  }

  // if online, validate with server
  if (navigator.onLine) {
    let response;
    try {
      response = await authFetch("is_logged_in.php", {
        method: "GET",
      });
    } catch (err) {
      // network error: trust local token
      return true;
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (err) {
      // invalid response: trust local token
      return true;
    }

    if (responseData.loggedIn && responseData.username === authUsername) {
      return true;
    } else {
      // token invalid: log out
      await logout(() => {}, () => {});
      return false;
    }
  }

  // offline: trust local token
  return true;
}

export async function login(username, password, onSuccess, onFailure) {
  let response;
  try {
    response = await fetch("login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
  } catch (err) {
    onFailure(err);
    return;
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (err) {
    onFailure(err);
    return;
  }

  if (responseData.success) {
    await storeAuth(responseData.token, responseData.username);
    onSuccess();
  } else {
    onFailure(new Error(responseData.error));
  }
}

export async function register(username, password, onSuccess, onFailure) {
  let response;
  try {
    response = await fetch("register.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        createdAt: Date.now(),
      }),
    });
  } catch (err) {
    onFailure(err);
    return;
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (err) {
    onFailure(err);
    return;
  }

  if (responseData.success) {
    await storeAuth(responseData.token, responseData.username);
    onSuccess();
  } else {
    onFailure(new Error(responseData.error));
  }
}

export async function logout(onSuccess, onFailure) {
  if (navigator.onLine) {
    try {
      await fetch("logout.php", {
        method: "POST"
      });
      await clearLocalData();
      onSuccess();
    } catch (err) {
      onFailure(err);
    }
  } else {
    onFailure(new Error("Offline logout not supported"));
  }
}
