<?php declare(strict_types=1);
namespace RMSY\Services;

class Projects extends \Framework\Services\AbstractService {
  public function getProjectsData(): array {
    return [
      [
        'text' => 'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
        'path' => '/beetle',
      ], [
        'text' => 'Robo-Messi: When Silicon Met Soccer',
        'path' => '/sdp',
      ],
    ];
  }
}
