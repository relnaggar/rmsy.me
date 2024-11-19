<?php

use RmsyMe\Components\ExternalLink;

?>

<p>
  You can view the source code at
  <?= (new ExternalLink(
    'https://github.com/relnaggar/veloz',
    'the project\'s GitHub',
  ))->render() ?>.
  The Composer package is available on
  <?= (new ExternalLink(
    'https://packagist.org/packages/relnaggar/veloz',
    'the project\'s packagist',
  ))->render() ?>.
</p>
