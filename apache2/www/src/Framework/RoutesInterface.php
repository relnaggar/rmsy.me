<?php declare(strict_types=1);
namespace Framework;

interface RoutesInterface {
  public function __construct(TemplateEngine $templateEngine);
  public function getRoutes(): array;
  public function getDefaultRoute(): array;
}
