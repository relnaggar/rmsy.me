<nav class="
  navbar
  navbar-expand-md
  sticky-top
  navbar-dark
  bg-dark
  navbar-horizontal
">
  <a
    class="navbar-brand-custom navbar-brand-right-banner"
    href="<?= $nav['homePath'] ?>"
  >
    <?= $nav['title'] ?>
  </a>
  <button
    class="navbar-toggler-custom"
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#navbar"
    aria-controls="navbar"
    aria-expanded="false"
    aria-label="Toggle navigation"
  >
    <div class="navbar-toggler-icon-manual"></div>
    <div class="navbar-toggler-icon-manual"></div>
    <div class="navbar-toggler-icon-manual"></div>
  </button>
  <div class="collapse navbar-collapse" id="navbar">
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      <?php foreach ($nav['items'] as $navItem): ?>
        <li class="
          nav-item
          <?= isset($navItem['dropdown']) ? 'dropdown' : '' ?>
        ">
        <?php if (isset($navItem['dropdown'])): ?>
            <a
              class="
                nav-link
                dropdown-toggle
                <?= ($navItem['text'] === $nav['activeItemText']) 
                  ? 'active'
                  : ''
                ?>
              "
              href="#"
              id="<?= $navItem['id'] ?>Dropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <?= $navItem['text'] ?>
            </a>
            <ul
              class="dropdown-menu dropdown-menu-dark"
              aria-labelledby="<?= $navItem['id'] ?>Dropdown"
            >
              <?php foreach ($navItem['dropdown'] as $dropdownItem): ?>
                <li>
                  <a class="dropdown-item" href="<?= $dropdownItem['path'] ?>">
                    <?= $dropdownItem['text'] ?>
                  </a>
                </li>
              <?php endforeach; ?>
            </ul>
          <?php else: ?>
            <a
            class="
                nav-link
                <?= ($navItem['text'] === $nav['activeItemText'])
                  ? 'active'
                  : ''
                ?>
              "
              href="<?= $navItem['path'] ?>"
              <?php if ($navItem['text'] === $nav['activeItemText']): ?>
                <?php if (isset($navItem['dropdown'])): ?>
                  aria-current="location"
                <?php else: ?>
                  aria-current="page"
                <?php endif; ?>
              <?php endif; ?>              
              <?php if (isset($navItem['target'])): ?>
                target="<?= $navItem['target'] ?>"
              <?php endif; ?>
              <?php if (isset($navItem['target'])
                  && $navItem['target'] === "_blank"): ?>
                rel="noopener noreferrer"
              <?php endif; ?>
            >
              <?=$navItem['text']?>
              <?php if (isset($navItem['target'])): ?>
                <i class="bi bi-box-arrow-up-right"></i>
              <?php endif; ?>
            </a>
          <?php endif; ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</nav>
