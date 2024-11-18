<?php

use RmsyMe\Components\ExternalLink;

?>

<div class="position-fixed bottom-1 end-1 z-3">
  <?= (new ExternalLink(
    '/free-meeting',
    'Book a free<br>meeting',
    'btn btn-cta btn-lg shadow-lg fw-bold p-3',
  ))->render(); ?>
</div>
