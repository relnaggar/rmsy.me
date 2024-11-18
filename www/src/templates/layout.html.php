<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php if (!empty($metaDescription)): ?>
      <meta name="description" content="<?= $metaDescription ?>">
    <?php endif ?>
    <?php if (!empty($metaRobots)): ?>
      <meta name="robots" content="<?= $metaRobots ?>">
    <?php endif ?>

    <title><?= $extendedTitle ?? $title ?? 'Untitled' ?></title>

    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="stylesheet" href="/css/styles.css">
    <link
      rel="preload"
      href="/fonts/bootstrap-icons.woff2?24e3eb84d0bcaf83d77f904c78ac1f47"
      as="font"
      type="font/woff2"
      crossorigin="anonymous"
    >
    <?php if (!empty($preloadImages)): ?>
      <?php foreach ($preloadImages as $preloadImage): ?>
        <link
          rel="preload"
          href="<?= "$mediaRoot/img/{$preloadImage->href}" ?>"
          as="image"
          type="<?= $preloadImage->getMimeType() ?>"
        >
      <?php endforeach; ?>
    <?php endif ?>
  </head>
  <!-- offest of 56 pixels for the unexpanded navbar height -->
  <body
    data-bs-spy="scroll"
    data-bs-target="#sidebarMenu"
    data-bs-offset="56"
    tabindex="0"
    class="position-relative"
  >
    <?php
      $databaseWorking = false;
      try {
        $pdo = new PDO('sqlite:/var/db/database.sqlite');
        $databaseWorking = true;
      } catch (PDOException $e) {
        $error = $e->getMessage();
      }
    ?>
    <div class="container-fluid d-flex flex-column p-0">
      <?php require 'layout/header.html.php'; ?>
      <?php !empty($menuNav) && require 'layout/menuNav.html.php'; ?>
      <div class="d-lg-none">
        <?php require 'layout/sidebarCollapsable.html.php'; ?>
      </div>
      <div class="d-flex flex-row">
        <div class="col-lg-2 col-md-1 d-none d-lg-block">
          <?php require 'layout/sidebarFixed.html.php'; ?>
        </div>
        <?php require 'layout/main.html.php'; ?>
        <?php require 'layout/fixed.html.php'; ?>
        <div class="col-lg-2 col-md-1 d-none d-lg-block">
          <?php
            !empty($onThisPage) && require 'layout/onThisPageSide.html.php';
          ?>
        </div>
      </div>
      <?php require 'layout/footer.html.php'; ?>
    </div>

    <script type="module" src="/js/main.js"></script>
  </body>
</html>
