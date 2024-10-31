<?php declare(strict_types=1);
namespace RMSY\Services;

class Projects extends \Framework\Services\AbstractService {
  public function getProjectsData(): array {
    return [
      [
        'text' => 'Summary',
        'path' => '/projects',
      ], [
        'text' => 'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
        'path' => '/projects/beetle',
      ], [
        'text' => 'Robo-Messi: When Silicon Met Soccer',
        'path' => '/projects/sdp',
      ],
    ];
  }
}
