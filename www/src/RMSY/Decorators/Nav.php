<?php declare(strict_types=1);
namespace RMSY\Decorators;

class Nav extends \Framework\Decorators\AbstractDecorator {
  public function getNewTemplateVars(array $templateVars): array {
    // add menu items
    $newTemplateVars['nav'] = $this->services['Menu']->getMenuData();
    
    // add projects dropdown items
    if (isset($newTemplateVars['nav']['items']['projects'])) {
      $projectsData = $this->services['Projects']->getProjectsData();
      foreach ($projectsData as $projectData) {
        $newTemplateVars['nav']['items']['projects']['dropdown']['items'][] = [
          'text' => $projectData['text'],
          'path' => $projectData['path'],
        ];
      }
    }

    // set the active item text
    $newTemplateVars['nav']['activeItemText'] = $templateVars['title'] ?? '';

    // if the active item is a dropdown item, set the active dropdown text
    $newTemplateVars['nav']['activeDropdownText'] = '';    
    if (isset($templateVars['title'])) {      
      foreach ($newTemplateVars['nav']['items'] as $navKey => $navItem) {
        if (
          isset($navItem['dropdown']) && isset($navItem['dropdown']['items'])
        ) {
          foreach ($navItem['dropdown']['items'] as $dropdownItem) {
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
