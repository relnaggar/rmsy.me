<?php declare(strict_types=1);
namespace RmsyMe\Components;

use Framework\Components\ComponentInterface;

class ExternalLink implements ComponentInterface {
  private readonly string $href;
  private readonly string $text;
  private readonly string $class;
  private readonly bool $isButton;

  public function __construct(
    string $href,
    string $text,
    string $class=''
  ) {
    $this->href = $href;
    $this->text = $text;
    $this->class = $class;
    $this->isButton = str_contains($class, 'btn');
  }

  public function render(): string {
    ob_start();
    ?>
      <a
        href="<?= $this->href ?>"
        target="_blank"
        rel="noopener noreferrer"
        <?php if ($this->class !== ''): ?>
          class="<?= $this->class ?>"
        <?php endif; ?>
      >
        <?= $this->text ?><?php if ($this->isButton): ?>
          <i class="bi bi-box-arrow-up-right"></i>
        <?php endif;?></a>
      <?php if (!$this->isButton): ?>
        <i class="bi bi-box-arrow-up-right"></i>
      <?php endif; ?>
    <?php
    return ob_get_clean();
  }
}
