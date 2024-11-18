<main class="flex-grow-1 m-5 d-flex flex-column min-vh-100" id="main">
  <h1><?= $title ?></h1>
  <?php if (!empty($subtitle)): ?>
    <div class="text-body-secondary h3">
      <?= $subtitle ?>
    </div>
  <?php endif; ?>
  <?php require 'main/previousNextButtons.html.php'; ?>
  <div class="mt-3">
    <?= $bodyContent ?>
  </div>
  <?php if (!empty($sections)): ?>
    <?php !empty($onThisPage) && require 'main/onThisPageFixed.html.php'; ?>
    <?php foreach ($sections as $section): ?>
      <section id="<?= $section->id ?>" class="mb-3">
        <h2><?= $section->title ?></h2>
        <hr>
        <?= $section->getHtmlContent() ?>
      </section>
    <?php endforeach; ?>
  <?php endif; ?>
  <?php require 'main/previousNextButtons.html.php'; ?>
</main>
