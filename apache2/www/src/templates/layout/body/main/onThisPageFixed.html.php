<nav class="navbar flex-column justify-content-start navbar-light bg-light display-none-lg-up border m-3 navbar-vertical">
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