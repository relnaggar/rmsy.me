<nav
  class="
    navbar
    flex-column
    justify-content-start
    navbar-light
    bg-light
    d-lg-none
    d-block
    border
    m-3
    navbar-vertical
  "
  data-nosnippet
>
  <span class="navbar-brand nav-link text-muted ps-3 pt-3 border-bottom">
    On this page
  </span>
  <ul class="navbar-nav">
    <?php foreach ($sections as $section): ?>
      <li class="nav-item">
        <a
          class="nav-link"
          href="#<?= $section->id ?>"
        >
          <?= $section->title ?>
        </a>
      </li>
      <?php if (!empty($section->subsections)): ?>
        <ul class="nav navbar-nav">
          <?php foreach ($section->subsections as $subsection): ?>
            <li class="nav-item">
              <a
                class="nav-link ms-3"
                href="#<?= $section->id ?>-<?= $subsection->id ?>"
              >
                <?= $subsection->title ?>
              </a>
            </li>
          <?php endforeach; ?>
        </ul>
      <?php endif; ?>
    <?php endforeach; ?>
  </ul>
</nav>
