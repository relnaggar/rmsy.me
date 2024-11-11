<?php declare(strict_types=1);
namespace RmsyMe\Decorators;

use Framework\Decorators\DecoratorInterface;

use RmsyMe\App;
use RmsyMe\Services\Nav as NavService;

class Nav implements DecoratorInterface {
  private NavService $navService;

  public function __construct(NavService $navService) {
    $this->navService = $navService;
  }

  public function getNewTemplateVars(array $templateVars): array {
    // set the active item in the nav data to whatever the title is
    $nav = $this->navService->getNav();
    $nav->setActiveItem(App::getCurrentPath());

    // add nav data to the template vars
    $newTemplateVars['menuNav'] = $nav;
    return $newTemplateVars;
  }
}
