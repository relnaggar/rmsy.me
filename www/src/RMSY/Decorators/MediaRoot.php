<?php declare(strict_types=1);
namespace RMSY\Decorators;

class MediaRoot implements \Framework\DecoratorInterface {
  public function get_new_template_vars(array $templateVars): array {
    $newTemplateVars['mediaRoot'] = 'https://media.rmsy.me';
    return $newTemplateVars;
  }
}
