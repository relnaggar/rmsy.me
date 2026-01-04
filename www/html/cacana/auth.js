let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export async function isLoggedIn(onError) {
  let response;
  try {
    response = await fetch("is_logged_in.php", {
      method: "GET",
      credentials: "same-origin",
    });
  } catch (err) {
    onError(err);
    return false;
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (err) {
    onError(err);
    return false;
  }

  if (responseData.loggedIn) {
    currentUser = responseData.username;
    return true;
  } else {
    currentUser = null;
    return false;
  }
}

export async function login(username, password, onSuccess, onFailure) {
  let response;
  try {
    response = await fetch("login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
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
    currentUser = responseData.username;
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
      credentials: "same-origin",
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
    currentUser = responseData.username;
    onSuccess();
  } else {
    onFailure(new Error(responseData.error));
  }
}

export async function logout(onSuccess, onFailure) {
  let response;

  try {
    response = await fetch("logout.php", {
      method: "POST",
      credentials: "same-origin",
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
    currentUser = null;
    onSuccess();
  } else {
    onFailure(new Error(responseData.error));
  }
}
