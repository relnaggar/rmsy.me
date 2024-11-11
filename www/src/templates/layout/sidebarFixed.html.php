<?php if (!empty($sidebarNav)): ?>
  <nav
    class="
      navbar
      flex-column
      navbar-light
      justify-content-start
      bg-light
      navbar-vertical
      sidebar
      flex-nowrap
    "
  >
    <ul class="navbar-nav w-100">
      <span class="navbar-brand p-3 m-0">
        <?= $sidebarNav->title ?>
      </span>
      <?php foreach ($sidebarNav->items as $sidebarNavItem): ?>
        <li class="nav-item">
          <a
            class="
              nav-link
              pe-3
              <?php if ($sidebarNavItem->isActive()): ?>
                active
              <?php endif; ?>
            "
            <?php if ($sidebarNavItem->isActive()): ?>
              aria-current="page"
            <?php endif; ?>
            href="<?= $sidebarNavItem->getPath() ?>">
            <?= $sidebarNavItem->text ?>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
    <div class="mb-5"></div>
  </nav>
<?php endif; ?>
