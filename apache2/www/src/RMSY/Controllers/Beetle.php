<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\TemplateEngine;

class Beetle extends AbstractProject {
  public function __construct(TemplateEngine $templateEngine, array $menu, array $project) {
    parent::__construct($templateEngine=$templateEngine, $templateDir='/beetle/', $menu=$menu, $project=$project);
  }

  public function introduction(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => $this->project['title'], 'noindex' => true]);
  }
}
