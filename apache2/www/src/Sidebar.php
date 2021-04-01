<?php declare(strict_types=1);
class Sidebar {
  /* @var string */
  private $title;

  /* @var array */
  private $items;

  /* @var int */
  private $activeItemNumber;

  public function __construct(string $title, array $items) {
    $this->title = $title;
    $this->items = $items;  
  }

  public function getTitle(): string {
    return $this->title;
  }

  public function getItems(): array {
    return $this->items;
  }

  public function setActiveItemText(string $itemText): void {
    foreach ($this->items as $itemNumber => $item) {
      if ($item['text'] === $itemText) {
        $this->activeItemNumber = $itemNumber;
      }
    }
  }

  public function isActive(int $itemNumber): bool {
    return $itemNumber === $this->activeItemNumber;
  }

  public function getNextPath(): string {
    return $this->items[$this->activeItemNumber+1]['path'] ?? "";
  }

  public function getPreviousPath(): string {
    return $this->items[$this->activeItemNumber-1]['path'] ?? "";
  }
}
