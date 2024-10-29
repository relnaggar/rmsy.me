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
    href="<?= $menu['homePath'] ?>"
  >
    <?= $menu['title'] ?>
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
      <?php foreach ($menu['items'] as $menuItem): ?>
        <li class="
          nav-item
          <?= isset($menuItem['dropdown']) ? 'dropdown' : '' ?>
        ">
        <?php if (isset($menuItem['dropdown'])): ?>
            <a
              class="
                nav-link
                dropdown-toggle
                <?= ($menuItem['text'] === $menu['activeItemText']) 
                  ? 'active'
                  : ''
                ?>
              "
              href="#"
              id="<?= $menuItem['id'] ?>Dropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <?= $menuItem['text'] ?>
            </a>
            <ul
              class="dropdown-menu dropdown-menu-dark"
              aria-labelledby="<?= $menuItem['id'] ?>Dropdown"
            >
              <?php foreach ($menuItem['dropdown'] as $dropdownItem): ?>
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
                <?= ($menuItem['text'] === $menu['activeItemText'])
                  ? 'active'
                  : ''
                ?>
              "
              href="<?= $menuItem['path'] ?>"
              <?php if ($menuItem['text'] === $menu['activeItemText']): ?>
                <?php if (isset($menuItem['dropdown'])): ?>
                  aria-current="location"
                <?php else: ?>
                  aria-current="page"
                <?php endif; ?>
              <?php endif; ?>              
              <?php if (isset($menuItem['target'])): ?>
                target="<?= $menuItem['target'] ?>"
              <?php endif; ?>
              <?php if (isset($menuItem['target'])
                  && $menuItem['target'] === "_blank"): ?>
                rel="noopener noreferrer"
              <?php endif; ?>
            >
              <?=$menuItem['text']?>
              <?php if (isset($menuItem['target'])): ?>
                <i class="bi bi-box-arrow-up-right"></i>
              <?php endif; ?>
            </a>
          <?php endif; ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</nav>
