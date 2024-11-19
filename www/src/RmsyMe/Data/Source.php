<?php

declare(strict_types=1);

namespace RmsyMe\Data;

class Source {
  public readonly string $title;
  public readonly string $icon;
  public readonly string $href;
  public readonly string $html;

  public function __construct(
    string $title,
    string $icon,
    string $href,
    string $html,
  ) {
    $this->title = $title;
    $this->icon = $icon;
    $this->href = $href;
    $this->html = $html;
  }
}
