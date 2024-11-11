<?php declare(strict_types=1);
namespace RmsyMe\Data;

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

  public function setActiveItem(string $activePath): void {
    if ($this->path === $activePath) {
      $this->active = true;
    }
    foreach ($this->dropdownItems as $item) {
      $item->setActiveItem($activePath);
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

  public function removeDropdownItem(NavItem $item): void {
    $index = array_search($item, $this->dropdownItems, true);
    unset($this->dropdownItems[$index]);
  }

  public function getAsNav(): Nav {
    return new Nav(
      homePath: $this->path,
      title: $this->text,
      items: $this->dropdownItems,
    );
  }
}
