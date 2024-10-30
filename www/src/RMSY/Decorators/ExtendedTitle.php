<?php declare(strict_types=1);
namespace RMSY\Decorators;

class ExtendedTitle implements \Framework\DecoratorInterface {
  public function get_new_template_vars(array $templateVars): array {
    $newTemplateVars['extendedTitle'] = $templateVars['title']
      . ' | Ramsey El-Naggar';
    return $newTemplateVars;
  }
}