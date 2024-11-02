<?php declare(strict_types=1);
namespace RMSY\Decorators;

class Nav extends \Framework\Decorators\AbstractDecorator {
  public function getNewTemplateVars(array $templateVars): array {
    // set the active item in the nav data to whatever the title is
    $nav = $this->services['Nav']->getNav();
    $nav->setActiveItem($templateVars['title'] ?? '');

    // add nav data to the template vars
    $newTemplateVars['nav'] = $nav;
    return $newTemplateVars;
  }
}
