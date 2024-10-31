<footer class="text-center bg-primary p-5 text-white">
  <p>
    Copyright &copy; <?= date("Y") ?> by Ramsey El-Naggar.
  </p>
  <p>
    <ul
      class="list-inline mb-0"
      aria-label="Social media links"
      role="navigation"
    >
      <?php foreach ($nav['items'] as $navKey => $navItem): ?>
        <?php if (isset($navItem['footerIcon'])): ?>
          <li class="list-inline-item me-1">
            <a
              class="text-white"
              href="<?= $navItem['path'] ?>"
              <?php if (isset($navItem['target'])): ?>
                target="<?= $navItem['target'] ?>"
              <?php endif; ?>
              <?php if (isset($navItem['rel'])): ?>
                rel="<?= $navItem['rel'] ?>"
              <?php endif; ?>
            >
              <span class="visually-hidden"><?= $navItem['text'] ?></span>
              <i class="bi bi-<?= $navItem['footerIcon'] ?>"></i></a>
          </li>
        <?php endif; ?>
      <?php endforeach; ?>
    </ul>
  </p>
</footer>
