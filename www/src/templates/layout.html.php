<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php if (isset($metaDescription)): ?>
      <meta name="description" content="<?= $metaDescription ?>">
    <?php endif ?>
    <?php if (isset($metaRobots)): ?>
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
  </head>
  <!-- offest of 56 pixels for the unexpanded navbar height -->
  <body
    data-bs-spy="scroll"
    data-bs-target="#sidebarMenu"
    data-bs-offset="56"
    tabindex="0"
    class="position-relative"
  >
    <div class="container-fluid d-flex flex-column p-0">
      <?php require 'layout/header.html.php'; ?>
      <?php isset($nav) && require 'layout/nav.html.php'; ?>
      <?php // require 'layout/sidebarCollapsable.html.php'; ?>
      <div class="d-flex flex-row">
        <?php require 'layout/sidebarFixed.html.php'; ?>
        <?php require 'layout/main.html.php'; ?>
        <?php require 'layout/backToTop.html.php'; ?>
        <div class="col-2 display-none-lg-down" data-nosnippet>
          <?php
            $onThisPage && require 'layout/onThisPageSide.html.php';
          ?>
        </div>
      </div>
      <?php require 'layout/footer.html.php'; ?>
    </div>

    <script type="module" src="/js/main.js" defer></script>
  </body>
</html>
