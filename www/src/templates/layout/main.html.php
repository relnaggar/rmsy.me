<main class="flex-grow-1 m-5 d-flex flex-column min-vh-100">
  <h1><?= $title ?></h1>
  <?php // require 'main/previousNextButtonsTop.html.php'; ?>
  <?php if (isset($sections)): ?>
    <div data-nosnippet>
      <?php $onThisPage && require 'main/onThisPageFixed.html.php'; ?>
      <?php foreach ($sections as $sectionId => $section): ?>
        <section id="<?= $sectionId ?>">
          <?php if (isset($section['title'])): ?>
            <h2><?= $section['title'] ?></h2>
          <?php endif; ?>
          <?= $section['html'] ?? '' ?>
          <?php if (isset($section['subsections'])): ?>
            <?php foreach ($section['subsections'] as $subsection): ?>
              <section id="<?= $sectionId ?>-<?= $subsection['id'] ?>">
                <h3><?= $subsection['title'] ?></h3>
                <?= $subsection['html'] ?>
              </section>
            <?php endforeach; ?>
          <?php endif; ?>
        </section>
      <?php endforeach; ?>
    </div>
  <?php else: ?>
    <div class="mt-3">
      <?= $bodyContent ?>
    </div>
  <?php endif; ?>
  <?php // require 'main/previousNextButtonsBottom.html.php'; ?>
</main>
