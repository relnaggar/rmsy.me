<main class="flex-grow-1 m-5 d-flex flex-column min-vh-100">
  <h1><?=$meta['title']?></h1>
  <?php require 'main/previousNextButtonsTop.html.php'; ?>
  <?php if (isset($sections)) { ?>
    <div data-nosnippet>
      <?php require 'main/onThisPageFixed.html.php'; ?>
      <?php foreach ($sections as $section) { ?>
        <section id="<?=$section['id']?>">
          <h2><?=$section['title']?></h2>
          <?=$section['html'] ?? ''?>
          <?php if (isset($section['subsections'])) { ?>
            <?php foreach ($section['subsections'] as $subsection) { ?>
              <section id="<?=$section['id']?>-<?=$subsection['id']?>">
                <h3><?=$subsection['title']?></h3>
                <?=$subsection['html']?>
              </section>
            <?php } ?>
          <?php } ?>
        </section>
      <?php } ?>
    </div>
  <?php } else { ?>
    <div class="mt-3">
      <?=$html?>
    </div>
  <?php } ?>
  <?php require 'main/previousNextButtonsBottom.html.php'; ?>
</main>