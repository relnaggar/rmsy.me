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
      'description' => 'Explore the intriguing world of dung beetle navigation through the eyes of a biorobot. This groundbreaking research unpacks how beetles use celestial cues to navigate, offering insights into biology and robotics alike.'
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
          'title' => 'Inside the Beetle Brain: It\'s Not All Dung and Games',
          'id' => 'brain'
        ], [
          'title' => 'Visual Cue Integration: The Sky\'s the Limit',
          'id' => 'cues'
        ], [
          'title' => 'Rolling in the Deep: A South African Saga',
          'id' => 'southAfrica'
        ]
      ]
    );
  }
}
