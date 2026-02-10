<?php

declare(strict_types=1);

namespace App\Data;

class Section
{
    public readonly string $id;
    public readonly string $title;
    private string $htmlContent = '';

    public function __construct(
        string $id,
        string $title,
    ) {
        $this->id = $id;
        $this->title = $title;
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
