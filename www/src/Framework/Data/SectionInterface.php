<?php declare(strict_types=1);
namespace Framework\Data;

interface SectionInterface {
  public function getTemplatePath(string $controllerName): string;
  public function setHtmlContent(string $htmlContent): void;
  public function getHtmlContent(): string;
}
