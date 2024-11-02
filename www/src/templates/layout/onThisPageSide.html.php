<?php if (isset($sections)): ?>
  <nav
    id="sidebarMenu"
    class="
      navbar
      navbar-light
      flex-column
      justify-content-start
      bg-light
      navbar-vertical
      sidebar
    "
  >
    <span class="border-bottom w-100 text-muted p-3">On this page</span>
    <ul class="navbar-nav w-100">
      <?php foreach ($sections as $sectionId => $section): ?>
        <li class="nav-item">
          <a class="nav-link" href="#<?= $sectionId ?>">
            <?=$section['title']?>
          </a>
        </li>
        <?php if (isset($section['subsections'])): ?>
          <ul class="nav navbar-nav">
            <?php foreach ($section['subsections'] as $subsection): ?>
              <li class="nav-item">
                <a
                  class="nav-link ms-3"
                  href="#<?=$section['id']?>-<?=$subsection['id']?>"
                >
                  <?=$subsection['title']?>
                </a>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      <?php endforeach; ?>
    </ul>
  </nav>
<?php endif; ?>
