<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\Views\Page;

class Projects extends \Framework\Controllers\AbstractController {
  public function summary(): Page {
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Project Summary',
        'metaDescription' => '',
      ]
    );
  }

  public function beetle(): Page {
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
        'metaDescription' => '',
      ]
    );
  }

  public function sdp(): Page {
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Robo-Messi: When Silicon Met Soccer',
        'metaDescription' => '',
      ]
    );
  }
}
