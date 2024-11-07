<main class="flex-grow-1 m-5 d-flex flex-column min-vh-100">
  <h1><?= $title ?></h1>
  <?php if (!empty($subtitle)): ?>
    <h3 class="text-body-secondary">
      <?= $subtitle ?>
    </h3>
  <?php endif; ?>
  <?php // require 'main/previousNextButtonsTop.html.php'; ?>
  <div class="mt-3">
    <?= $bodyContent ?>
  </div>
  <?php if (!empty($sections)): ?>
    <?php !empty($onThisPage) && require 'main/onThisPageFixed.html.php'; ?>
    <?php foreach ($sections as $section): ?>
      <section id="<?= $section->id ?>" class="mb-3">
        <?php if (!empty($section->title)): ?>
          <h2><?= $section->title ?></h2>
          <hr>
        <?php endif; ?>
        <?= $section->getHtmlContent() ?>
      </section>
    <?php endforeach; ?>
  <?php endif; ?>
  <?php // require 'main/previousNextButtonsBottom.html.php'; ?>
</main>
