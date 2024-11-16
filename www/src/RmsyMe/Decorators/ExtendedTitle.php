<?php

declare(strict_types=1);

namespace RmsyMe\Decorators;

use Relnaggar\Veloz\Decorators\DecoratorInterface;

/**
 * Decorator to add the site title to the end of the page title.
 */
class ExtendedTitle implements DecoratorInterface
{
  public function getNewTemplateVars(array $templateVars): array {
    $newTemplateVars['extendedTitle'] = $templateVars['title']
      . ' | Ramsey El-Naggar';
    return $newTemplateVars;
  }
}
