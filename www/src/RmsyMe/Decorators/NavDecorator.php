<?php

declare(strict_types=1);

namespace RmsyMe\Decorators;

use Relnaggar\Veloz\Decorators\DecoratorInterface;
use RmsyMe\{
  App,
  Services\NavService,
};

/**
 * Decorator to add the nav data to the template vars.
 */
class NavDecorator implements DecoratorInterface
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
