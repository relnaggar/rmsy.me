<?php declare(strict_types=1);
namespace RMSY\Services;

class Projects extends \Framework\Services\AbstractService {
  public function getData(): array {
    return [
      'beetle' => [
        'title' => 'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
        'description' => '',
      ],
      'sdp' => [
        'title' => 'Robo-Messi: When Silicon Met Soccer',
        'description' => '',
      ],
    ];
  }
}
