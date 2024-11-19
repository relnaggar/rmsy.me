<?php

declare(strict_types=1);

namespace RmsyMe\Components;

use Relnaggar\Veloz\Components\ComponentInterface;
use RmsyMe\Data\Source;

class SourceCards implements ComponentInterface
{
  private readonly array $sources;

  public function __construct(array $sources)
  {
    foreach ($sources as $source) {
      if (!$source instanceof Source) {
        $class = Source::class;
        throw new \InvalidArgumentException(
          "Each source must be an instance of $class.",
        );
      }
    }
    $this->sources = $sources;
  }

  public function render(): string
  {
    ob_start();
    ?>
      <div class="row">
        <?php foreach ($this->sources as $source): ?>
          <div class="col-md-6 mb-3">
            <div class="card flex-column equal-height">
              <div class="card-header">
                <div class="mb-0 h6"><?= $source->title ?></div>
              </div>
              <div class="card-body">
                <i class="bi bi-<?= $source->icon ?>"></i>
                &nbsp;
                <a
                  href="<?= $source->href ?>"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <?= $source->html ?></a>
                <i class="bi bi-box-arrow-up-right"></i>
              </div>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php
    return ob_get_clean();
  }
}
