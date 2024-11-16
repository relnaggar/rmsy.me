<?php

declare(strict_types=1);

namespace RmsyMe\Data;

use Relnaggar\Veloz\Data\SectionInterface;

class Section implements SectionInterface
{
  public readonly string $id;
  private string $templateDirectory;
  public readonly string $title;
  private string $htmlContent;

  public function __construct(
    string $id,
    string $templateDirectory,
    string $title = '',
  ) {
    $this->id = $id;
    $this->templateDirectory = $templateDirectory;
    $this->title = $title;
    $this->htmlContent = '';
  }

  public function getTemplatePath(string $controllerName): string
  {
    return "$controllerName/{$this->templateDirectory}/{$this->id}";
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
