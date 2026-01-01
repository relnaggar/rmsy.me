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
    <p>Welcome to <?= $APP_NAME ?>!</p>

    <button id="addCacaButton">Add Caca</button>

    <ul id="cacaList">
      <li id="loadingCacaList">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </li>
    </ul>

    <script type="module" src="./app.js" defer></script>
  </body>
</html>
