<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php if (isset($metaDescription)): ?>
      <meta name="description" content="<?= $metaDescription ?>">
    <?php endif ?>
    <link rel="stylesheet" href="/css/styles.css">
    <link
      rel="preload"
      href="/fonts/bootstrap-icons.woff2?24e3eb84d0bcaf83d77f904c78ac1f47"
      as="font"
      type="font/woff2"
      crossorigin="anonymous"
    >
    <title><?= $title ?? 'Untitled' ?></title>
  </head>
  <body>
    <?= $bodyContent ?>
    <script type="module" src="/js/main.js" defer></script>
  </body>
</html>
