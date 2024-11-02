<footer class="text-center bg-primary p-5 text-white">
  <ul
    class="list-inline mb-4"
    aria-label="Social media links"
    role="navigation"
  >
    <?php foreach ($nav->items as $navKey => $navItem): ?>
      <?php if ($navItem->inFooter): ?>
        <li class="list-inline-item mx-3">
          <a
            class="text-white"
            href="<?= $navItem->getPath() ?>"
            <?php if ($navItem->external): ?>
              target="_blank"
            <?php endif; ?>
            <?php if ($navItem->external): ?>
              rel="noopener noreferrer"
            <?php endif; ?>
          >
            <span class="visually-hidden"><?= $navItem->text ?></span>
            <i class="bi bi-<?= $navItem->icon ?> h2"></i></a>
        </li>
      <?php endif; ?>
    <?php endforeach; ?>
  </ul>
  <p>
    Copyright &copy; <?= date("Y") ?> by
    <a href='/about' class="text-decoration-none text-white">Ramsey El-Naggar</a>.
  </p>
</footer>
