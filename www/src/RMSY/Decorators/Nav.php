<?php declare(strict_types=1);
namespace RMSY\Decorators;

class Nav extends \Framework\Decorators\AbstractDecorator {
  public function getNewTemplateVars(array $templateVars): array {
    // add menu items
    $newTemplateVars['nav'] = $this->services['Menu']->getMenuData();
    
    // add projects dropdown items
    if (isset($newTemplateVars['nav']['items']['projects'])) {
      $newTemplateVars['nav']['items']['projects']['dropdown'] = 
        $this->services['Projects']->getProjectsData();
    }

    // set the active item text
    $newTemplateVars['nav']['activeItemText'] = $templateVars['title'] ?? '';

    // if the active item is a dropdown item, set the active dropdown text
    $newTemplateVars['nav']['activeDropdownText'] = '';    
    if (isset($templateVars['title'])) {      
      foreach ($newTemplateVars['nav']['items'] as $navKey => $navItem) {
        if (isset($navItem['dropdown'])) {
          foreach ($navItem['dropdown'] as $dropdownItem) {
            if (
              $dropdownItem['text'] ===
              $newTemplateVars['nav']['activeItemText']
            ) {
              $newTemplateVars['nav']['activeDropdownText'] = $navItem['text'];
            }
          }
        }
      }
    }

    return $newTemplateVars;
  }
}
