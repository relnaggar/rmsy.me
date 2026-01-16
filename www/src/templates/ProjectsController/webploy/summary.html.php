<?php

use RmsyMe\Components\SourceCards;

?>

<ul>
  <li>
    Containerised application using Docker; built automated DevOps pipeline;
    configured AWS and Apache.
  </li>
</ul>

<?= (new SourceCards($sources))->render() ?>
