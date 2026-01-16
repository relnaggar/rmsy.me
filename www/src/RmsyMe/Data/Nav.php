<?php

declare(strict_types=1);

namespace RmsyMe\Data;

use Exception;

class Nav {
  public readonly string $homePath;
  public readonly string $title;
  public readonly array $items;
  public readonly bool $previousNextButtonsEnabled;

  public function __construct(
    string $homePath,
    string $title,
    array $items,
    bool $previousNextButtonsEnabled = false,
  ) {
    // validate the items array
    foreach ($items as $item) {
      if (!($item instanceof NavItem)) {
        throw new Exception('Invalid item in items array');
      }
    }

    $this->homePath = $homePath;
    $this->title = $title;
    $this->items = $items;
    $this->previousNextButtonsEnabled = $previousNextButtonsEnabled;
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
   * Check if previous/next buttons are enabled.
   *
   * @return bool True if previous/next buttons are enabled, false otherwise.
   */
  public function isPreviousNextButtonsEnabled(): bool
  {
    return $this->previousNextButtonsEnabled;
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
        return $previousItem ? $previousItem->getPath() : '';
      }
      $previousItem = $item;
    }
    return '';
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
    return '';
  }
}
