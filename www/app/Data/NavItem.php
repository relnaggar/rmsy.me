<?php

declare(strict_types=1);

namespace App\Data;

use Exception;

class NavItem
{
    public readonly string $text;
    private string $path;
    public readonly bool $external;
    private bool $active = false;
    private array $dropdownItems = [];
    public readonly string $icon;
    public readonly bool $inMenu;
    public readonly bool $inFooter;
    public readonly bool $alignEnd;
    public readonly bool $previousNextButtonsEnabled;
    public readonly string $method;

    public function __construct(
        string $text,
        string $path,
        bool $external = false,
        string $icon = '',
        bool $inMenu = true,
        bool $inFooter = false,
        bool $alignEnd = false,
        bool $previousNextButtonsEnabled = false,
        string $method = 'GET',
    ) {
        $this->text = $text;
        $this->path = $path;
        $this->external = $external;
        $this->icon = $icon;
        $this->inMenu = $inMenu;
        $this->inFooter = $inFooter;
        $this->alignEnd = $alignEnd;
        $this->previousNextButtonsEnabled = $previousNextButtonsEnabled;
        $this->method = $method;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function setActiveItem(string $activePath): void
    {
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

    public function isDropdown(): bool
    {
        return ! empty($this->dropdownItems);
    }

    public function getDropdownItems(): array
    {
        return $this->dropdownItems;
    }

    public function addDropdownItem(NavItem $item): void
    {
        if ($item->isDropdown()) {
            throw new Exception(
                'Cannot add a dropdown item to a dropdown item'
            );
        }
        $this->dropdownItems[] = $item;
    }

    public function removeDropdownItem(NavItem $item): void
    {
        $index = array_search($item, $this->dropdownItems, true);
        if ($index !== false) {
            unset($this->dropdownItems[$index]);
        }
    }

    public function getAsNav(): Nav
    {
        return new Nav(
            homePath: $this->path,
            title: $this->text,
            items: $this->dropdownItems,
            previousNextButtonsEnabled: $this->previousNextButtonsEnabled,
        );
    }
}
