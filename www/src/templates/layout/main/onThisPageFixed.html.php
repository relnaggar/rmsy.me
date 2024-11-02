<nav class="
  navbar
  flex-column
  justify-content-start
  navbar-light
  bg-light
  display-none-lg-up
  border
  m-3
  navbar-vertical
">
  <span class="border-bottom text-muted p-3">On this page</span>
  <ul class="navbar-nav">
    <?php foreach ($sections as $sectionId => $section): ?>
      <li class="nav-item">
        <a
          class="nav-link"
          href="#<?= $sectionId ?>"
        >
          <?= $section['title'] ?>
        </a>
      </li>
      <?php if (isset($section['subsections'])): ?>
        <ul class="nav navbar-nav">
          <?php foreach ($section['subsections'] as $subsection): ?>
            <li class="nav-item">
              <a
                class="nav-link ms-3"
                href="#<?= $sectionId ?>-<?= $subsection['id'] ?>"
              >
                <?= $subsection['title'] ?>
              </a>
            </li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>
    <?php endforeach; ?>
  </ul>
</nav>
