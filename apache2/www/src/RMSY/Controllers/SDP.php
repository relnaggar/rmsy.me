<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\TemplateEngine;

class SDP extends AbstractProject {
  public function __construct(TemplateEngine $templateEngine, array $menu, array $project) {
    parent::__construct($templateEngine=$templateEngine, $templateDir='/sdp/', $menu=$menu, $project=$project);
  }


  public function introduction(): array {
    return $this->basic(__FUNCTION__, $meta=[
      'title' => $this->project['title'],
      'description' => 'Join the journey of building Robo-Messi, the football-playing LEGO robot that changed robo-football forever.'
    ], $vars=[], $sections=[
        [
          'title' => 'Executive Summary',
          'id' => 'summary'
        ], [
          'title' => 'SDP: The Third-Year Frontier',
          'id' => 'introduction'
        ], [
          'title' => "The Building Blocks of Victory",
          'id' => 'construction'
        ], [
          'title' => 'A Robo-mantic Comedy: The LEGO That Wouldn\'t Listen',
          'id' => 'communication'
        ], [
          'title' => 'Sense and Sensibility',
          'id' => 'sensing'
        ], [
          'title' => 'Strategising with Silicon: Robo-Messi\'s Robo-Brain',
          'id' => 'strategy'
        ], [
          'title' => 'How I Learned to Love the Chaos',
          'id' => 'takeaways'
        ]
      ]
    );
  }
}