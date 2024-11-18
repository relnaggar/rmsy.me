<?php

use RmsyMe\Components\ExternalLink;

?>

<p>
  You can view the source code for the tip that you see, plus the rest of the 
  iceberg that you don't see, all at
  <?= (new ExternalLink(
    'https://github.com/relnaggar/rmsy.me',
    'the project\'s GitHub',
  ))->render() ?>.
</p>
