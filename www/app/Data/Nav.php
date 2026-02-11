<?php

declare(strict_types=1);

namespace App\Data;

use Exception;

class Nav
{
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
            if (! ($item instanceof NavItem)) {
                throw new Exception('Invalid item in items array');
            }
        }

        $this->homePath = $homePath;
        $this->title = $title;
        $this->items = $items;
        $this->previousNextButtonsEnabled = $previousNextButtonsEnabled;
    }

    public function setActiveItem(string $activePath): void
    {
        foreach ($this->items as $item) {
            $item->setActiveItem($activePath);
        }
    }

    public function isPreviousNextButtonsEnabled(): bool
    {
        return $this->previousNextButtonsEnabled;
    }

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
