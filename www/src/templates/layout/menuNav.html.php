<nav class="
  navbar
  navbar-expand-lg
  sticky-top
  navbar-dark
  bg-dark
  navbar-horizontal
">
  <a
    class="navbar-brand-custom navbar-brand-right-banner"
    href="<?= $menuNav->homePath ?>"
  >
    <?= $menuNav->title ?>
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
      <?php foreach ($menuNav->items as $navKey => $navItem): ?>
        <li class="nav-item <?= $navItem->isDropdown() ? 'dropdown' : '' ?>">
          <?php if ($navItem->isDropdown()): ?>
            <a
              class="
                nav-link
                dropdown-toggle
                <?= ($navItem->isActive()) ? 'active' : ''?>
              "
              href="#"
              id="dropdown<?= $navKey ?>"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              <?php if ($navItem->isActive()): ?>
                aria-current="location"
              <?php endif; ?>
            >
              <?= $navItem->text ?>
            </a>
            <ul
              class="dropdown-menu dropdown-menu-dark"
              aria-labelledby="dropdown<?= $navKey ?>"
            >
              <?php foreach ($navItem->getDropdownItems() as $dropdownItem): ?>
                <li>
                  <a
                    class="
                      dropdown-item
                      <?= ($dropdownItem->isActive()) ? 'active' : '' ?>
                    "
                    href="<?= $dropdownItem->getPath() ?>"
                    <?php if ($dropdownItem->isActive()): ?>
                      aria-current="page"
                    <?php endif; ?>
                    <?php if ($dropdownItem->external): ?>
                      target="_blank"
                      rel="noopener noreferrer"
                    <?php endif; ?>
                  >
                    <?= $dropdownItem->text ?>
                    <?php if ($dropdownItem->external): ?>
                      <i class="bi bi-box-arrow-up-right"></i>
                    <?php endif; ?>
                  </a>
                </li>
              <?php endforeach; ?>
            </ul>
          <?php else: ?>
            <a
              class="nav-link <?= ($navItem->isActive()) ? 'active' : '' ?>"
              href="<?= $navItem->getPath() ?>"
              <?php if ($navItem->isActive()): ?>
                aria-current="page"
              <?php endif; ?>              
              <?php if ($navItem->external): ?>
                target="_blank"
              <?php endif; ?>
              <?php if ($navItem->external): ?>
                rel="noopener noreferrer"
              <?php endif; ?>
            >
              <?php // if (!empty($navItem->icon)): ?>
              <?php if (false): ?>
                <span class="visually-hidden"><?= $navItem->text ?></span>
                <i class ="bi bi-<?= $navItem->icon ?>"></i>                
              <?php else: ?>
                <?=$navItem->text?>
                <?php if ($navItem->external): ?>
                  <i class="bi bi-box-arrow-up-right"></i>
                <?php endif; ?>
              <?php endif; ?>
            </a>
          <?php endif; ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</nav>
