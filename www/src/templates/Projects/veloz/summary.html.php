<?php

use RmsyMe\Components\SourceCards;

?>

<ul>
  <li>
    Built reusable PHP backend from scratch including routing, templating and
    dependency management with PHP-DI.
  </li>
  <li>
    Published on packagist as self-contained Composer package with 100% PHPUnit
    test coverage.
  </li>
</ul>

<?= (new SourceCards($sources))->render() ?>
