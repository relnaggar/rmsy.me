<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use RmsyMe\Data\{
  Project,
  Source,
};

class Projects
{
  private array $projects;

  public function __construct()
  {
    $this->projects = [];
    $this->addProject(new Project(
      'rmsy.me',
      '🖼 My Mona Lisa: A Personal Website',
      '',
      'Find out how I gave birth to this technological tapestry. '
        . 'Curiosity is better than regret!',
      'thumbnail.webp',
      //  preloadImageFile: 'preload.jpg',
      featured: true,
      sections: [
        ['summary', 'Executive Summary'],
      ],
      sources: [
        new Source(
          title: 'GitHub',
          icon: 'github',
          href: 'https://github.com/relnaggar/rmsy.me',
          html: 'relnaggar/rmsy.me',
        ),
      ]
    ));
    $this->addProject(new Project(
      'veloz',
      '⚡ Veloz: Yet Another PHP Mini-Framework',
      '',
      'Could this be the next big drop in the PHP ocean? Dive in and find out!',
      'thumbnail.webp',
      //  preloadImageFile: 'preload.jpg',
      sections: [
        ['summary', 'Executive Summary'],
      ],
      sources: [
        new Source(
          title: 'GitHub',
          icon: 'github',
          href: 'https://github.com/relnaggar/veloz',
          html: 'relnaggar/veloz',
        ),
        new Source(
          title: 'Packagist',
          icon: 'box-seam',
          href: 'https://packagist.org/packages/relnaggar/veloz',
          html: 'packages/relnaggar/veloz',
        )
      ]
    ));
    $this->addProject(new Project(
      'webploy',
      '🚀 WebPloy: From Apache 2 Production',
      '',
      'Drama-free deployment for your Apache 2 projects. '
        . 'Avoid the chaos and focus on the code!',
      'thumbnail.webp',
      //  preloadImageFile: 'preload.jpg',
      sections: [
        ['summary', 'Executive Summary'],
        ['template', 'Template'],
        ['deploy', 'Deployment'],
      ],
      sources: [
        new Source(
          title: 'Template GitHub',
          icon: 'github',
          href: 'https://github.com/relnaggar/apache2-template',
          html: 'relnaggar/apache2-template',
        ),
        new Source(
          title: 'Deployment GitHub',
          icon: 'github',
          href: 'https://github.com/relnaggar/apache2-deploy',
          html: 'relnaggar/apache2-deploy',
        ),
      ]
    ));
    $this->addProject(new Project(
      'beetle',
      '🪲 Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
      'Explore the intriguing world of dung beetle navigation through the eyes '
      . 'of a biorobot. This groundbreaking research unpacks how beetles use '
      . 'celestial cues to navigate, offering insights into biology and '
      . 'robotics alike.',
      'Robot vs beetle: who will be the ultimate fighting champion?',
      'vs-robot.webp',
      preloadImageFile: 'beetles-fighting.jpg',
      featured: true,
      sections: [
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
      '⚽ Robo-Messi: When Silicon Met Soccer',
      'Join the journey of building Robo-Messi, the football-playing LEGO '
      . 'robot that changed robo-football forever.',
      'Robo-Messi wants a hug. Will you give him one?',
      'hug.jpg',
      preloadImageFile: 'initial-front.jpg',
      sections: [
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

  public function getProject(string $slug): ?Project
  {
    if (array_key_exists($slug, $this->projects)) {
      return $this->projects[$slug];
    } else {
      return null;
    }
  }
}
