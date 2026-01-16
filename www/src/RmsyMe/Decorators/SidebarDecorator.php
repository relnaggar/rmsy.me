<?php

declare(strict_types=1);

namespace RmsyMe\Decorators;

use Relnaggar\Veloz\Decorators\DecoratorInterface;
use RmsyMe\{
  Services\NavService,
  App,
};

/**
 * Decorator to add the sidebar nav data to the template vars.
 */
class SidebarDecorator implements DecoratorInterface
{
  private NavService $navService;

  public function __construct(NavService $navService)
  {
    $this->navService = $navService;
  }

  public function getNewTemplateVars(array $templateVars): array
  {
    // the sidebar nav is based on the root of the current path
    // for example, if the current path is /projects/project-name,
    // the sidebar nav will be based on /projects
    $currentPath = App::getCurrentPath();
    $sidebarRoot = '/' . explode('/', $currentPath)[1];
    $sidebarNav = $this->navService->getNavItem($sidebarRoot)->getAsNav();
    $newTemplateVars['sidebarNav'] = $sidebarNav;
    return $newTemplateVars;
  }
}
