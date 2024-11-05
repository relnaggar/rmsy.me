<?php declare(strict_types=1);
namespace RmsyMe\Data;

class Image {
  public readonly string $href;

  public function __construct(string $href) {
    $this->href = $href;
  }

  public function getType(): string {
    $parts = explode('.', $this->href);
    $extension = $parts[count($parts) - 1];
    return match ($extension) {
      'jpg', 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      default => throw new \Exception('Unsupported image type'),
    };
  }
}
