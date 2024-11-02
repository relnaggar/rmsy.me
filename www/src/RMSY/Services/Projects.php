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
      ],
    ];
  }
}
