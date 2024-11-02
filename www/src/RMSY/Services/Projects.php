<?php declare(strict_types=1);
namespace RMSY\Services;

class Projects extends \Framework\Services\AbstractService {
  public function getData(): array {
    return [
      'beetle' => [
        'title' => 'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
        'description' => '',
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
        'description' => '',
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
