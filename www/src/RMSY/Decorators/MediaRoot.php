<?php declare(strict_types=1);
namespace RMSY\Decorators;

class MediaRoot extends \Framework\Decorators\AbstractDecorator {
  public function getNewTemplateVars(array $templateVars): array {
    $newTemplateVars['mediaRoot'] = $this->services['Media']->getMediaRoot();
    return $newTemplateVars;
  }
}
