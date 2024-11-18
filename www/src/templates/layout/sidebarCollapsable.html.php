<?php if (!empty($sidebarNav)): ?>
  <nav
    class="
      navbar
      navbar-expand-lg
      navbar-light
      bg-light
      navbar-horizontal
    "
  >
    <button
      class="navbar-toggler-custom"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#sidebar"
      aria-controls="sidebar"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <span class="navbar-brand-custom"><?= $sidebarNav->title ?></span>
    <div class="collapse navbar-collapse" id="sidebar">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <?php foreach ($sidebarNav->items as $sidebarNavItem): ?>
          <li class="nav-item">
            <a
              class="
                nav-link
                <?php if ($sidebarNavItem->isActive()): ?>
                  active
                <?php endif; ?>
              "
              <?php if ($sidebarNavItem->isActive()): ?>
                aria-current="page"
              <?php endif; ?>
              href="<?= $sidebarNavItem->getPath() ?>"
            >
              <?= $sidebarNavItem->text ?>
            </a>
          </li>
        <?php endforeach; ?>
      </ul>
    </div>
  </nav>
<?php endif; ?>
