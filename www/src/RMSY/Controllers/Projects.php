<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\Views\Page;

class Projects extends \Framework\Controllers\AbstractController {
  public function index(): Page {
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Projects Summary',
        'metaDescription' => '',
      ]
    );
  }

  public function show(string $projectSlug, array $projectData): Page {
    return $this->getPage(
      $projectSlug,
      [
        'title' => $projectData['title'],
        'metaDescription' => $projectData['description'],
      ]
    );
  }
}
