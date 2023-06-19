<?php if (isset($sidebar)) { ?>
  <nav class="navbar navbar-expand-md navbar-light bg-light navbar-horizontal display-none-md-up">
    <button class="navbar-toggler-custom" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar" aria-controls="sidebar" aria-expanded="false" aria-label="Toggle navigation">
      <div class="navbar-toggler-icon-manual"></div>
      <div class="navbar-toggler-icon-manual"></div>
      <div class="navbar-toggler-icon-manual"></div>
    </button>
    <span class="navbar-brand-custom"><?=$sidebar->getTitle()?></span>
    <div class="collapse navbar-collapse" id="sidebar">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <?php foreach ($sidebar->getItems() as $itemNumber => $sidebarItem) { ?>
          <li class="nav-item">
            <a class="nav-link<?php if ($sidebar->isActive($itemNumber)) {?> active<?php }?>"<?php if ($sidebar->isActive($itemNumber)) { ?> aria-current="page"<?php } ?> href="<?=$sidebarItem['path']?>"><?=$sidebarItem['text']?></a>
          </li>
        <?php } ?>
      </ul>
    </div>
  </nav>
<?php } ?>