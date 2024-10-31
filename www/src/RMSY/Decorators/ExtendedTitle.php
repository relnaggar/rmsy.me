<?php declare(strict_types=1);
namespace RMSY\Decorators;

class ExtendedTitle extends \Framework\Decorators\AbstractDecorator {
  public function getNewTemplateVars(array $templateVars): array {
    $newTemplateVars['extendedTitle'] = $templateVars['title']
      . ' | Ramsey El-Naggar';
    return $newTemplateVars;
  }
}
