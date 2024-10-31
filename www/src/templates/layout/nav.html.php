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
      <?php foreach ($nav['items'] as $navKey => $navItem): ?>
        <li class="
          nav-item
          <?= isset($navItem['dropdown']) ? 'dropdown' : '' ?>
        ">
          <?php if (isset($navItem['dropdown'])): ?>
            <a
              class="
                nav-link
                dropdown-toggle
                <?= ($navItem['text'] === $nav['activeDropdownText'])
                  ? 'active'
                  : ''
                ?>
              "
              href="#"
              id="<?= $navKey ?>Dropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              <?php if ($navItem['text'] === $nav['activeDropdownText']): ?>
                aria-current="location"
              <?php endif; ?>
            >
              <?= $navItem['text'] ?>
            </a>
            <ul
              class="dropdown-menu dropdown-menu-dark"
              aria-labelledby="<?= $navKey ?>Dropdown"
            >
              <?php foreach ($navItem['dropdown']['items'] as $dropdownItem): ?>
                <li>
                  <a
                    class="
                      dropdown-item
                      <?= ($dropdownItem['text'] === $nav['activeItemText'])
                        ? 'active'
                        : ''
                      ?>
                    "
                    href="<?=
                      $navItem['dropdown']['basePath'] . $dropdownItem['path']
                    ?>"
                    <?php if (
                      $dropdownItem['text'] === $nav['activeItemText']
                    ): ?>
                      aria-current="page"
                    <?php endif; ?>
                    <?php if (isset($dropdownItem['target'])): ?>
                      target="<?= $dropdownItem['target'] ?>"
                    <?php endif; ?>
                    <?php if (isset($dropdownItem['rel'])): ?>
                      rel="<?= $dropdownItem['rel'] ?>"
                    <?php endif; ?>
                  >
                    <?= $dropdownItem['text'] ?>
                    <?php if (
                      isset($dropdownItem['target']) &&
                      ($dropdownItem['target'] === "_blank")
                    ): ?>
                      <i class="bi bi-box-arrow-up-right"></i>
                    <?php endif; ?>
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
                aria-current="page"
              <?php endif; ?>              
              <?php if (isset($navItem['target'])): ?>
                target="<?= $navItem['target'] ?>"
              <?php endif; ?>
              <?php if (isset($navItem['rel'])): ?>
                rel="<?= $navItem['rel'] ?>"
              <?php endif; ?>
            >
              <?php if ((isset($navItem['menuIcon']))): ?>
                <i class ="bi bi-<?= $navItem['menuIcon'] ?>"></i>
              <?php endif; ?>
              <?=$navItem['text']?>
              <?php if (
                isset($navItem['target']) && ($navItem['target'] === "_blank")
              ): ?>
                <i class="bi bi-box-arrow-up-right"></i>
              <?php endif; ?>
            </a>
          <?php endif; ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</nav>
