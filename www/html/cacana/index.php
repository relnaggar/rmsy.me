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
  <body class="container d-flex flex-column align-items-center py-4">
    <h1>
      <?= $APP_NAME ?>
      <img
        src="./icons/icon-192.png"
        alt="Cacana Logo"
        class="ms-2 align-top"
        height="32"
      >
    </h1>

    <div id="authContent" class="d-none">
      <p id="authError" class="text-danger"></p>

      <form id="loginForm" class="d-none">
        <div class="mb-3">
          <label class="form-label" for="loginUsername">Username</label>
          <input
            id="loginUsername"
            class="form-control"
            type="text"
            name="username"
            autocomplete="username"
            required
          >
        </div>
        <div class="mb-3">
          <label class="form-label" for="loginPassword">Password</label>
          <input
            id="loginPassword"
            class="form-control"
            type="password"
            name="password"
            autocomplete="current-password"
            required
          >
        </div>
        <button class="btn btn-primary" type="submit">Login</button>
        <p class="mt-3">
          Don't have an account?
          <a href="#" id="showRegisterLink">Register</a>
        </p>
      </form>

      <form id="registerForm" class="d-none">
        <div class="mb-3">
          <label class="form-label" for="registerUsername">Username</label>
          <input
            id="registerUsername"
            class="form-control"
            type="text"
            name="username"
            autocomplete="username"
            required
          >
        </div>
        <div class="mb-3">
          <label class="form-label" for="registerPassword">Password</label>
          <input
            id="registerPassword"
            class="form-control"
            type="password"
            name="new-password"
            autocomplete="new-password"
            required
          >
        </div>
        <div class="mb-3">
          <label class="form-label" for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            class="form-control"
            type="password"
            name="confirm-password"
            autocomplete="new-password"
            required
          >
        </div>
        <button class="btn btn-primary" type="submit">Register</button>
        <p class="mt-3">
          Already have an account?
          <a href="#" id="showLoginLink">Login</a>
        </p>
      </form>
    </div>

    <div id="appContent" class="d-none pb-5 mb-5">
      <p>Welcome to <?= $APP_NAME ?>, <span id="authUsername"></span>!</p>
      <div class="d-flex justify-content-between">
        <button
          id="logoutButton"
          class="btn btn-secondary"
          type="button"
          disabled
        >
          Logout
        </button>
        <button id="syncButton" class="btn btn-primary flex-grow-1 mx-1" type="button">
          <span id="loadingSpinner"></span>
          <span id="syncButtonText"></span>
        </button>
        <button id="refreshButton" class="btn btn-success" type="button">
          Refresh
        </button>
      </div>

      <hr>

      <div id="homeContainer" class="text-center">
        <div class="d-grid mb-2">
          <button id="addCacaButton" class="btn btn-brown" type="button">
            Add Caca
          </button>
        </div>
        <table id="cacaTable" class="table">
          <tbody id="cacaTableBody">
          </tbody>
        </table>
      </div>

      <div id="statsContainer" class="d-none text-center">
      </div>

      <div id="settingsContainer" class="d-none text-center">
        <div class="mb-3">
          <label class="form-label" for="userColourInput">
            User colour:
          </label>
          <input
            id="userColourInput"
            class="form-control form-control-color mx-auto"
            type="color"
            name="userColour"
            value="#000000"
          >
        </div>
      </div>

      <nav class="fixed-bottom bg-light border-top">
        <ul class="nav nav-justified">
          <li class="nav-item border-end">
            <button
              id="homeButton"
              class="nav-link"
              type="button"
            >
              <div class="bi bi-house-door-fill"></div>
              Home
            </button>
          </li>
          <li class="nav-item border-end">
            <button
              id="statsButton"
              class="nav-link"
              type="button"
            >
              <div class="bi bi-bar-chart-fill"></div>
              Stats
            </button>
          </li>
          <li class="nav-item">
            <button
              id="settingsButton"
              class="nav-link"
              type="button"
            >
              <div class="bi bi-gear-fill"></div>
              Settings
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <script type="module" src="./app.js" defer></script>
  </body>
</html>
