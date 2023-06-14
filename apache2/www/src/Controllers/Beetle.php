<?php declare(strict_types=1);
namespace Controllers;
class Beetle extends Project {
  public function __construct(array $menu, array $project) {
    parent::__construct($templateDir='/beetle/', $menu=$menu, $project=$project);
  }

  public function introduction(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => 'Dung Beetle Biorobot project', 'noindex' => true]);
  }
}
