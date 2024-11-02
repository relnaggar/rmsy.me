<?php declare(strict_types=1);
namespace RMSY\Data;

class NavItem {
  public readonly string $text;
  private string $path;
  public readonly bool $external;
  private bool $active;
  private array $dropdownItems;
  public readonly string $icon;
  public readonly bool $inFooter;

  public function __construct(
    string $text,
    string $path,
    bool $external=false,
    string $icon='',
    bool $inFooter=false
  ) {
    $this->text = $text;
    $this->path = $path;
    $this->external = $external;
    $this->active = false;
    $this->dropdownItems = [];
    $this->icon = $icon;
    $this->inFooter = $inFooter;
  }

  public function getPath(): string {
    return $this->path;
  }

  public function addBasePath(string $basePath): void {
    $this->path = $basePath . $this->path;
  }

  public function isActive(): bool {
    return $this->active;
  }

  public function setActiveItem(string $activeItemText): void {
    if ($this->text === $activeItemText) {
      $this->active = true;
    }
    foreach ($this->dropdownItems as $item) {
      $item->setActiveItem($activeItemText);
      if ($item->isActive()) {
        $this->active = true;
      }
    }
  }

  public function isDropdown(): bool {
    return !empty($this->dropdownItems);
  }

  public function getDropdownItems(): array {
    return $this->dropdownItems;
  }

  public function addDropdownItem(NavItem $item): void {
    if ($item->isDropdown()) {
      throw new \Exception('Cannot add a dropdown item to a dropdown item');
    }
    $item->addBasePath($this->path);
    $this->dropdownItems[] = $item;
  }
}
