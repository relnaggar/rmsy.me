<?php declare(strict_types=1);
namespace RmsyMe\Components;

use Framework\Components\ComponentInterface;

class ExternalLink implements ComponentInterface {
  private readonly string $href;
  private readonly string $text;

  public function __construct(string $href, string $text) {
    $this->href = $href;
    $this->text = $text;
  }

  public function render(): string {
    ob_start();
    ?>
      <a href="<?= $this->href ?>" target="_blank" rel="noopener noreferrer">
        <?= $this->text ?></a>
      <i class="bi bi-box-arrow-up-right"></i>
    <?php
    return ob_get_clean();
  }
}
