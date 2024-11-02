<?php declare(strict_types=1);
namespace RMSY\Data;

class Nav {
  public readonly string $homePath;
  public readonly string $title;
  public readonly array $items;

  public function __construct(
    string $homePath,
    string $title,
    array $items
  ) {
    // validate the items array
    foreach ($items as $item) {
      if (!($item instanceof NavItem)) {
        throw new \Exception('Invalid item in items array');
      }
    }

    $this->homePath = $homePath;
    $this->title = $title;
    $this->items = $items;
  }

  public function setActiveItem(string $activeItemText): void {
    foreach ($this->items as $item) {
      $item->setActiveItem($activeItemText);
    }
  }
}
