<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\TemplateEngine;

class Beetle extends AbstractProject {
  public function __construct(TemplateEngine $templateEngine, array $menu, array $project) {
    parent::__construct($templateEngine=$templateEngine, $templateDir='/beetle/', $menu=$menu, $project=$project);
  }

  public function introduction(): array {
    return $this->basic(__FUNCTION__, $meta=[
      'title' => $this->project['title'],
      'description' => 'TODO'
    ], $vars=[], $sections=[
        [
          'title' => 'Executive Summary',
          'id' => 'summary'
        ], [
          'title' => 'The Beetle Hunter Diaries',
          'id' => '101'
        ], [
          'title' => 'Say Hello to My Little Friend',
          'id' => 'robot'
        ], [
          'title' => 'Neural Model',
          'id' => 'brain'
        ], [
          'title' => 'South Africa',
          'id' => 'southAfrica'
        ]
      ]
    );
  }
}
