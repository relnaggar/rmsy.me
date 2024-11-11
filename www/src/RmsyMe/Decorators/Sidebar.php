<?php declare(strict_types=1);
namespace RmsyMe\Decorators;

use Framework\Decorators\DecoratorInterface;

use RmsyMe\Services\Nav as NavService;
use RmsyMe\App;

class Sidebar implements DecoratorInterface {
  private NavService $navService;

  public function __construct(NavService $navService) {
    $this->navService = $navService;
  }

  public function getNewTemplateVars(array $templateVars): array {
    $currentPath = App::getCurrentPath();
    $sidebarRoot = '/' . explode('/', $currentPath)[1];
    $sidebarNav = $this->navService->getNavItem($sidebarRoot)->getAsNav();
    $newTemplateVars['sidebarNav'] = $sidebarNav;
    return $newTemplateVars;
  }
}
