<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use RmsyMe\Data\Project;

class Projects
{
  private array $projects;

  public function __construct()
  {
    $this->projects = [];
    $this->addProject(new Project(
      'beetle',
      'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
      'Explore the intriguing world of dung beetle navigation through the eyes '
      . 'of a biorobot. This groundbreaking research unpacks how beetles use '
      . 'celestial cues to navigate, offering insights into biology and '
      . 'robotics alike.',
      'Robot vs beetle: who will be the ultimate fighting champion?',
      'vs-robot.jpg',
      'beetles-fighting.jpg',
      [
        ['summary', 'Executive Summary'],
        ['beetles101', 'The Beetle Hunter Diaries'],
        ['robot', 'Say Hello to My Little Friend'],
        ['brain', 'Inside the Beetle Brain: It\'s Not All Dung and Games'],
        ['cues', 'Visual Cue Integration: The Sky\'s the Limit'],
        ['southAfrica', 'Rolling in the Deep: A South African Saga'],
      ]
    ));
    $this->addProject(new Project(
      'sdp',
      'Robo-Messi: When Silicon Met Soccer',
      'Join the journey of building Robo-Messi, the football-playing LEGO '
      . 'robot that changed robo-football forever.',
      'Robo-Messi wants a hug. Will you give him one?',
      'hug.jpg',
      'initial-front.jpg',
      [
        ['summary', 'Executive Summary'],
        ['introduction', 'SDP: The Third-Year Frontier'],
        ['construction', 'The Building Blocks of Victory'],
        ['communication', 'A Robo-mantic Comedy: The LEGO That Wouldn\'t Listen'],
        ['sensing', 'Sense and Sensibility'],
        ['strategy', 'Strategising with Silicon: Robo-Messi\'s Robo-Brain'],
        ['takeaways', 'How I Learned to Love the Chaos'],
      ]
    ));
  }

  private function addProject(Project $project): void
  {
    $this->projects[$project->slug] = $project;
  }

  public function getProjects(): array
  {
    return $this->projects;
  }

  public function getProject(string $slug): Project
  {
    return $this->projects[$slug];
  }
}
