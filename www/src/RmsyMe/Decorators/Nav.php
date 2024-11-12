<?php

declare(strict_types=1);

namespace RmsyMe\Decorators;

use Framework\Decorators\DecoratorInterface;
use RmsyMe\{
  App,
  Services\Nav as NavService,
};

/**
 * Decorator to add the nav data to the template vars.
 */
class Nav implements DecoratorInterface
{
  private NavService $navService;

  public function __construct(NavService $navService)
  {
    $this->navService = $navService;
  }

  public function getNewTemplateVars(array $templateVars): array
  {
    // set the active item in the nav data to the current path
    $nav = $this->navService->getNav();
    $nav->setActiveItem(App::getCurrentPath());

    // add nav data to the template vars
    $newTemplateVars['menuNav'] = $nav;
    return $newTemplateVars;
  }
}
