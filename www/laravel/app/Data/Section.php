<?php

declare(strict_types=1);

namespace App\Data;

class Section
{
    public readonly string $id;
    public readonly string $templateDirectory;
    public readonly string $title;
    private string $htmlContent = '';

    public function __construct(
        string $id,
        string $templateDirectory,
        string $title = '',
    ) {
        $this->id = $id;
        $this->templateDirectory = $templateDirectory;
        $this->title = $title;
    }

    public function getViewName(string $baseView): string
    {
        return "{$baseView}.{$this->templateDirectory}.{$this->id}";
    }

    public function setHtmlContent(string $htmlContent): void
    {
        $this->htmlContent = $htmlContent;
    }

    public function getHtmlContent(): string
    {
        return $this->htmlContent;
    }
}
