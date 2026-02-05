<?php

declare(strict_types=1);

namespace App\Data;

use InvalidArgumentException;

class Project
{
    public readonly string $slug;
    public readonly string $title;
    public readonly string $metaDescription;
    public readonly string $thumbnailDescription;
    public readonly Image $thumbnail;
    public readonly bool $featured;
    private array $sections;
    public readonly array $sources;

    public function __construct(
        string $slug,
        string $title,
        string $metaDescription,
        string $thumbnailDescription,
        string $thumbnailFile,
        bool $featured = false,
        array $sections = [],
        array $sources = [],
    ) {
        $this->slug = $slug;
        $this->title = $title;
        $this->metaDescription = $metaDescription;
        $this->thumbnailDescription = $thumbnailDescription;
        $this->thumbnail = new Image($this->slug.'/'.$thumbnailFile);
        $this->featured = $featured;

        // validate the sections array and add each section
        $this->sections = [];
        foreach ($sections as $section) {
            if (count($section) !== 2) {
                throw new InvalidArgumentException(
                    'Each section must have exactly two elements: an ID and a title.',
                );
            }
            $this->addSection($section[0], $section[1]);
        }

        // validate the sources array
        foreach ($sources as $source) {
            if (! $source instanceof Source) {
                throw new InvalidArgumentException(
                    'Each source must be an instance of '.Source::class.'.',
                );
            }
        }
        $this->sources = $sources;
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
        return route('projects.show', $this->slug);
    }
}
