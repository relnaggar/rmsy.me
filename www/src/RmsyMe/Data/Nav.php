<?php

declare(strict_types=1);

namespace RmsyMe\Data;

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

  /**
   * Set the active item in the navigation based on the current path.
   *
   * @param string $activePath The path to the currently active item.
   */
  public function setActiveItem(string $activePath): void
  {
    foreach ($this->items as $item) {
      $item->setActiveItem($activePath);
    }
  }

  /**
   * Get the path to the previous item in the navigation.
   *
   * @return string The path to the previous item in the navigation.
   */
  public function getPreviousPath(): string
  {
    $previousItem = null;
    foreach ($this->items as $item) {
      if ($item->isActive()) {
        return $previousItem ? $previousItem->getPath() : "";
      }
      $previousItem = $item;
    }
    return "";
  }

  /**
   * Get the path to the next item in the navigation.
   *
   * @return string The path to the next item in the navigation.
   */
  public function getNextPath(): string
  {
    $foundActive = false;
    foreach ($this->items as $item) {
      if ($foundActive) {
        return $item->getPath();
      }
      if ($item->isActive()) {
        $foundActive = true;
      }
    }
    return "";
  }
}
