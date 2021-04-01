<?php declare(strict_types=1);

class Sidebar {
  /* @var string */
  private $title;

  /* @var array */
  private $items;

  /* @var i */
  private $i;

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

  public function setI(int $i): void {
    $this->i = $i;
  }

  public function isActive(int $i): bool {
    return $i === $this->i;
  }

  public function getNextPath(): string {
    return $this->items[$this->i+1]['path'] ?? "";
  }

  public function getPreviousPath(): string {
    return $this->items[$this->i-1]['path'] ?? "";
  }
}
