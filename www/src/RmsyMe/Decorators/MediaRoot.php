<?php declare(strict_types=1);
namespace RmsyMe\Decorators;

use Framework\Decorators\AbstractDecorator;

class MediaRoot extends AbstractDecorator {
  public function getNewTemplateVars(array $templateVars): array {
    $newTemplateVars['mediaRoot'] = $this->services['Media']->getMediaRoot();
    return $newTemplateVars;
  }
}
