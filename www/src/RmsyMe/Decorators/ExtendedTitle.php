<?php declare(strict_types=1);
namespace RmsyMe\Decorators;

use Framework\Decorators\AbstractDecorator;

class ExtendedTitle extends AbstractDecorator {
  public function getNewTemplateVars(array $templateVars): array {
    $newTemplateVars['extendedTitle'] = $templateVars['title']
      . ' | Ramsey El-Naggar';
    return $newTemplateVars;
  }
}
