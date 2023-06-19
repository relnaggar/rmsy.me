<nav class="navbar navbar-expand-md sticky-top navbar-dark bg-dark navbar-horizontal">
  <a class="navbar-brand-custom navbar-brand-right-banner" href="<?=$menu['homePath']?>"><?=$menu['title']?></a>
  <button class="navbar-toggler-custom" type="button" data-bs-toggle="collapse" data-bs-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
    <div class="navbar-toggler-icon-manual"></div>
    <div class="navbar-toggler-icon-manual"></div>
    <div class="navbar-toggler-icon-manual"></div>
  </button>
  <div class="collapse navbar-collapse" id="navbar">
    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
      <?php foreach ($menu['items'] as $menuItem) { ?>
        <li class="nav-item<?php if (isset($menuItem['dropdown'])) { ?> dropdown<?php } ?>">
          <?php if (isset($menuItem['dropdown'])) { ?>
            <a class="nav-link dropdown-toggle<?php if ($menuItem['text'] === $menu['activeItemText']) { ?> active<?php } ?>" href="#" id="<?=$menuItem['id']?>Dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <?=$menuItem['text'] ?>
            </a>
            <ul class="dropdown-menu dropdown-menu-dark" aria-labelledby="<?=$menuItem['id']?>Dropdown">
              <?php foreach ($menuItem['dropdown'] as $dropdownItem) { ?>
                <li><a class="dropdown-item" href="<?=$dropdownItem['path']?>"><?=$dropdownItem['text']?></a></li>
              <?php } ?>
            </ul>
          <?php } else { ?>
            <a class="nav-link<?php if ($menuItem['text'] === $menu['activeItemText']) { ?> active<?php } ?>"<?php if ($menuItem['text'] === $menu['activeItemText']) { ?> aria-current="location"<?php } ?> href="<?=$menuItem['path']?>" <?php if (isset($menuItem['target'])) { ?>target="<?=$menuItem['target']?>"<?php } ?>>
              <?=$menuItem['text']?>
              <?php if (isset($menuItem['target'])) { ?>
                <?=includeIcon('box-arrow-up-right')?>
              <?php } ?>
            </a>
          <?php } ?>
        </li>
      <?php } ?>
    </ul>
  </div>
</nav>