<?php declare(strict_types=1);
namespace RmsyMe\Services;

use Framework\Services\AbstractService;

class Projects extends AbstractService {
  public function getData(): array {
    return [
      'beetle' => [
        'title' => 'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
        'description' => 'Robot vs beetle: who will be the ultimate fighting ' .
          'champion?',
        'image' => 'vs-robot.jpg',
        'sections' => [
          'summary' => [
            'title' => 'Executive Summary',
          ],
          'beetles101' => [
            'title' => 'The Beetle Hunter Diaries',
          ],
          'robot' => [
            'title' => 'Say Hello to My Little Friend',
          ],
          'brain' => [
            'title' => 'Inside the Beetle Brain: It\'s Not All Dung and Games',
          ],
          'cues' => [
            'title' => 'Visual Cue Integration: The Sky\'s the Limit',
          ],
          'southAfrica' => [
            'title' => 'Rolling in the Deep: A South African Saga',
          ],
        ],
      ],
      'sdp' => [
        'title' => 'Robo-Messi: When Silicon Met Soccer',
        'description' => 'Robo-Messi wants a hug. Will you give him one?',
        'image' => 'hug.jpg',
        'sections' => [
          'summary' => [
            'title' => 'Executive Summary',
          ],
          'introduction' => [
            'title' => 'SDP: The Third-Year Frontier',
          ],
          'construction' => [
            'title' => "The Building Blocks of Victory",
          ],
          'communication' => [
            'title' => 'A Robo-mantic Comedy: The LEGO That Wouldn\'t Listen',
          ],
          'sensing' => [
            'title' => 'Sense and Sensibility',
          ],
          'strategy' => [
            'title' => 'Strategising with Silicon: Robo-Messi\'s Robo-Brain',
          ],
          'takeaways' => [
            'title' => 'How I Learned to Love the Chaos',
          ],
        ],
      ],
    ];
  }
}
