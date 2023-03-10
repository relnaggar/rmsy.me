<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="/assets/custom.bootstrap.min.css">

    <title><?=$meta['title']?> | <?php if (isset($sidebar)) { ?><?=$sidebar->getTitle()?> | <?php } ?>Ramsey El-Naggar</title>
    <?php if (isset($meta['description'])) { ?>
      <meta name="description" content="<?=$meta['description']?>">
    <?php } ?>
    <?php if (isset($meta['noindex']) && $meta['noindex']) { ?>
      <meta name="robots" content="noindex">
    <?php } ?>
  </head>
  <!-- offest of 56 pixels for the unexpanded navbar height -->
  <body data-bs-spy="scroll" data-bs-target="#sidebarMenu" data-bs-offset="56" tabindex="0" class="position-relative">
    <div class="container-fluid d-flex flex-column p-0">
      <header class="text-center">
        <div class="display-none-md-down d-flex">
          <a href="/" class="display-4 flex-fill text-reset left-banner bg-contrast-primary">&lt;<b>r</b>a<b>ms</b>e<b>y</b><b class="banner-link">.me</b>&gt;</a>
          <span class="display-none-md-down display-4 flex-fill" id="center-banner">Ramsey El&#8209;Naggar</span>
          <a href="<?=$menu['homePath']?>" class="display-none-xxl-down display-4 link-primary bg-contrast-primary text-decoration-none flex-fill" id="right-banner"><?=$menu['title']?></a>
        </div>
        <div class="display-none-md-up">
          <a href="/" class="display-2 text-reset left-banner">&lt;<b>rmsy</b><b class="banner-link">.me</b>&gt;</a>
        </div>
      </header>
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
                  <a class="nav-link dropdown-toggle" href="#" id="<?=$menuItem['id']?>Dropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
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
      <div class="d-flex flex-row">
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
        <main class="flex-grow-1 m-5 d-flex flex-column min-vh-100">
          <h1><?=$meta['title']?></h1>
          <?php if (isset($sidebar) && ($sidebar->getPreviousPath() || $sidebar->getNextPath())) { ?>
            <div class="text-center">
              <div class="btn-group">
                <?php if ($sidebar->getPreviousPath()) { ?>
                  <a href="<?=$sidebar->getPreviousPath()?>" class="btn btn-primary">&#8592; Previous</a>
                <?php } ?>
                <?php if ($sidebar->getNextPath()) { ?>
                  <a href="<?=$sidebar->getNextPath()?>" class="btn btn-primary">Next &#8594;</a>
                <?php } ?>
              </div>
            </div>
          <?php } ?>
          <?php if (isset($sections)) { ?>
            <div data-nosnippet>
              <nav class="navbar flex-column justify-content-start navbar-light bg-light display-none-md-up border m-3 navbar-vertical">
                <span class="border-bottom text-muted p-3">On this page</span>
                <ul class="navbar-nav">
                  <?php foreach ($sections as $section) { ?>
                    <li class="nav-item">
                      <a class="nav-link" href="#<?=$section['id']?>"><?=$section['title']?></a>
                    </li>
                    <?php if (isset($section['subsections'])) { ?>
                      <ul class="nav navbar-nav">
                        <?php foreach ($section['subsections'] as $subsection) { ?>
                          <li class="nav-item">
                            <a class="nav-link ms-3" href="#<?=$section['id']?>-<?=$subsection['id']?>"><?=$subsection['title']?></a>
                          </li>
                        <?php } ?>                    
                      </ul>
                    <?php } ?>
                  <?php } ?>
                </ul>
              </nav>
              <?php foreach ($sections as $section) { ?>
                <section id="<?=$section['id']?>">
                  <h2><?=$section['title']?></h2>
                  <?=$section['html'] ?? ''?>
                  <?php if (isset($section['subsections'])) { ?>
                    <?php foreach ($section['subsections'] as $subsection) { ?>
                      <section id="<?=$section['id']?>-<?=$subsection['id']?>">
                        <h3><?=$subsection['title']?></h3>
                        <?=$subsection['html']?>
                      </section>
                    <?php } ?>
                  <?php } ?>
                </section>
              <?php } ?>
            </div>
          <?php } else { ?>
            <div class="mt-3">
              <?=$html?>
            </div>
          <?php } ?>
          <?php if (isset($sidebar) && ($sidebar->getPreviousPath() || $sidebar->getNextPath())) { ?>
            <div class="flex-grow-1"></div>
            <div class="text-center">
              <div class="btn-group">
                <?php if ($sidebar->getPreviousPath()) { ?>
                  <a href="<?=$sidebar->getPreviousPath()?>" class="btn btn-primary">&#8592; Previous</a>
                <?php } ?>
                <?php if ($sidebar->getNextPath()) { ?>
                  <a href="<?=$sidebar->getNextPath()?>" class="btn btn-primary">Next &#8594;</a>
                <?php } ?>
              </div>
            </div>
          <?php } ?>
        </main>
        <a href="#" class="btn btn-primary position-fixed bottom-0 end-0 display-none-md-up">^</a>
        <div class="col-2 display-none-md-down" data-nosnippet>
          <?php if (isset($sections)) { ?>
            <nav id="sidebarMenu" class="navbar navbar-light flex-column justify-content-start bg-light navbar-vertical sidebar">
              <span class="border-bottom w-100 text-muted p-3">On this page</span>
              <ul class="navbar-nav w-100">
                <?php foreach ($sections as $section) { ?>
                  <li class="nav-item">
                    <a class="nav-link" href="#<?=$section['id']?>"><?=$section['title']?></a>
                  </li>
                  <?php if (isset($section['subsections'])) { ?>
                    <ul class="nav navbar-nav">
                      <?php foreach ($section['subsections'] as $subsection) { ?>
                        <li class="nav-item">
                          <a class="nav-link ms-3" href="#<?=$section['id']?>-<?=$subsection['id']?>"><?=$subsection['title']?></a>
                        </li>
                      <?php } ?>                    
                    </ul>
                  <?php } ?>
                <?php } ?>
              </ul>
            </nav>
          <?php } ?>
        </div>
      </div>
      <footer class="text-center bg-primary p-5">
        Copyright &copy; 2020-<?=date("Y")?> by Ramsey El-Naggar.  
      </footer>
    </div>
    <script src="/assets/bootstrap.bundle.min.js"></script>
  </body>
</html>
