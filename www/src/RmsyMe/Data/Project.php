<?php

declare(strict_types=1);

namespace RmsyMe\Data;

class Project
{
  public readonly string $slug;
  public readonly string $title;
  public readonly string $metaDescription;
  public readonly string $thumbnailDescription;
  public readonly Image $thumbnail;
  public readonly ?Image $preloadImage;
  public readonly bool $featured;
  private array $sections;

  public function __construct(
    string $slug,
    string $title,
    string $metaDescription,
    string $thumbnailDescription,
    string $thumbnailFile,
    ?string $preloadImageFile = null,
    bool $featured = false,
    array $sections = [],
  ) {
    $this->slug = $slug;
    $this->title = $title;
    $this->metaDescription = $metaDescription;
    $this->thumbnailDescription = $thumbnailDescription;
    $this->thumbnail = new Image($this->slug . '/' . $thumbnailFile);
    if ($preloadImageFile !== null) {
      $this->preloadImage = new Image($this->slug . '/' . $preloadImageFile);
    } else {
      $this->preloadImage = null;
    }
    $this->featured = $featured;

    // validate the sections array and add each section
    $this->sections = [];
    foreach ($sections as $section) {
      if (count($section) !== 2) {
        throw new \InvalidArgumentException(
          'Each section must have exactly two elements: an ID and a title.',
        );
      }
      $this->addSection($section[0], $section[1]);
    }
  }

  private function addSection(string $id, string $title): void
  {
    $this->sections[] = new Section(
      id: $id,
      templateDirectory: $this->slug,
      title: $title,
    );
  }

  public function getSections(): array
  {
    return $this->sections;
  }

  public function getPath(): string
  {
    return "/projects/{$this->slug}";
  }
}
