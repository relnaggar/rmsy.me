<?php declare(strict_types=1);
namespace Controllers;
class SDP extends Project {
  public function __construct(array $menu, array $project) {
    parent::__construct($templateDir='/sdp/', $menu=$menu, $project=$project);
  }

  public function introduction(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => $this->project['title'], 'noindex' => true]);
  }
}
