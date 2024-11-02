<div class="col-2 display-none-md-down">
  <?php if (isset($sidebar)) { ?>
    <nav class="navbar flex-column navbar-light justify-content-start bg-light navbar-vertical sidebar flex-nowrap">
      <span class="navbar-brand p-3"><?=$sidebar->getTitle()?></span>
      <ul class="navbar-nav w-100">
        <?php foreach ($sidebar->getItems() as $itemNumber => $sidebarItem) { ?>
          <li class="nav-item">
          <a class="nav-link<?php if ($sidebar->isActive($itemNumber)) {?> active<?php }?>"<?php if ($sidebar->isActive($itemNumber)) { ?> aria-current="page"<?php } ?> href="<?=$sidebarItem['path']?>"><?=$sidebarItem['text']?></a>
          </li>
        <?php } ?>
      </ul>
      <div class="mb-5"></div>
    </nav>
  <?php } ?>
</div>
