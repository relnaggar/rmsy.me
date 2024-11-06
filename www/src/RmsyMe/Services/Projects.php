<?php declare(strict_types=1);
namespace RmsyMe\Services;

use RmsyMe\Data\Project;

class Projects {
  private array $projects;

  public function __construct() {
    $this->projects = [];

    $beetle = new Project(
      'beetle',
      'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
      'Robot vs beetle: who will be the ultimate fighting champion?',
      'vs-robot.jpg',
      'beetles-fighting.jpg',
    );
    $beetle->addSection('summary', 'Executive Summary');
    $beetle->addSection('beetles101', 'The Beetle Hunter Diaries');
    $beetle->addSection('robot', 'Say Hello to My Little Friend');
    $beetle->addSection(
      'brain',
      'Inside the Beetle Brain: It\'s Not All Dung and Games'
    );
    $beetle->addSection('cues', 'Visual Cue Integration: The Sky\'s the Limit');
    $beetle->addSection(
      'southAfrica',
      'Rolling in the Deep: A South African Saga'
    );
    $this->projects[$beetle->slug] = $beetle;

    $sdp = new Project(
      'sdp',
      'Robo-Messi: When Silicon Met Soccer',
      'Robo-Messi wants a hug. Will you give him one?',
      'hug.jpg',
      'initial-front.jpg',
    );
    $sdp->addSection('summary', 'Executive Summary');
    $sdp->addSection('introduction', 'SDP: The Third-Year Frontier');
    $sdp->addSection('construction', 'The Building Blocks of Victory');
    $sdp->addSection(
      'communication',
      'A Robo-mantic Comedy: The LEGO That Wouldn\'t Listen'
    );
    $sdp->addSection('sensing', 'Sense and Sensibility');
    $sdp->addSection(
      'strategy',
      'Strategising with Silicon: Robo-Messi\'s Robo-Brain'
    );
    $sdp->addSection(
      'takeaways',
      'How I Learned to Love the Chaos'
    );
    $this->projects[$sdp->slug] = $sdp;
  }

  public function getProjects(): array {
    return $this->projects;
  }

  public function getProject(string $slug): Project {
    return $this->projects[$slug];
  }
}
