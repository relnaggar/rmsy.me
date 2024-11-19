<?php

use RmsyMe\Components\ExternalLink;

?>

<p>
  This project is spread over two repositories.
</p>

<ul>
  <li>
    <?= (new ExternalLink(
      'https://github.com/relnaggar/apache2-template',
      'One',
    ))->render() ?>
  </li>
  <li>
  <?= (new ExternalLink(
      'https://github.com/relnaggar/apache2-deploy',
      'Two',
    ))->render() ?>
  </li>
</ul>
