<?php
  $APP_NAME = "Cacana";
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#7F6A3D">
    <link rel="manifest" href="./manifest.webmanifest">
    <link rel="icon" type="image/x-icon" href="./icons/favicon.ico">
    <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png">
    <link href="../css/cacana.css" rel="stylesheet" type="text/css">
    <title><?= $APP_NAME ?></title>
  </head>
  <body>
    <h1><?= $APP_NAME ?></h1>

    <div id="authContent" class="d-none">
      <p id="authError" class="text-danger"></p>

      <form id="loginForm" class="d-none">
        <div>
          <label for="loginUsername">Username</label>
          <input
            id="loginUsername"
            type="text"
            name="username"
            autocomplete="username"
            required
          >
        </div>
        <div>
          <label for="loginPassword">Password</label>
          <input
            id="loginPassword"
            type="password"
            name="password"
            autocomplete="current-password"
            required
          >
        </div>
        <button class="btn btn-primary" type="submit">Login</button>
        <p>
          Don't have an account?
          <a href="#" id="showRegisterLink">Register</a>
        </p>
      </form>

      <form id="registerForm" class="d-none">
        <div>
          <label for="registerUsername">Username</label>
          <input
            type="text"
            name="username"
            autocomplete="username"
            required
            id="registerUsername"
          >
        </div>
        <div>
          <label for="registerPassword">Password</label>
          <input
            id="registerPassword"
            type="password"
            name="new-password"
            autocomplete="new-password"
            required
          >
        </div>
        <div>
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirm-password"
            autocomplete="new-password"
            required
          >
        </div>
        <button class="btn btn-primary" type="submit">Register</button>
        <p>Already have an account? <a href="#" id="showLoginLink">Login</a></p>
      </form>
    </div>

    <div id="appContent" class="d-none">
      <p>Welcome to <?= $APP_NAME ?>, <span id="currentUser"></span>!</p>
      <button id="logoutButton" class="btn btn-secondary" type="button">
        Logout
      </button>
      <button id="syncButton" class="btn btn-primary" type="button">
        <span id="loadingSpinner"></span>
        <span id="syncButtonText"></span>
      </button>
      <button id="addCacaButton" class="btn btn-primary" type="button">
        Add Caca
      </button>
      <ul id="cacaList"></ul>
    </div>

    <script type="module" src="./app.js" defer></script>
  </body>
</html>
