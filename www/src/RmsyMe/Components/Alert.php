<?php

declare(strict_types=1);

namespace RmsyMe\Components;

use Framework\Components\ComponentInterface;

class Alert implements ComponentInterface
{
  private readonly string $type;
  private readonly string $title;
  private readonly string $message;

  public function __construct(string $type, string $title, string $message)
  {
    $this->type = $type;
    $this->title = $title;
    $this->message = $message;
  }

  public function render(): string
  {
    ob_start();
    ?>
      <div class="alert alert-<?= $this->type ?>" role="alert">
        <h4 class="alert-heading"><?= $this->title ?></h4>
        <p><?= $this->message ?></p>
      </div>
    <?php
    return ob_get_clean();
  }
}
