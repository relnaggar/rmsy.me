<?php declare(strict_types=1);
namespace RmsyMe\Controllers;

use Framework\Controllers\AbstractController;
use Framework\Views\Page;

class Projects extends AbstractController {
  public function index(): Page {
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Projects Summary',
        'metaDescription' => '',
      ]
    );
  }

  public function show(string $projectSlug): Page {
    $project = $this->services['Projects']->getData()[$projectSlug];

    $className = (new \ReflectionClass($this))->getShortName();
    if (isset($project['sections'])) {
      foreach (($project['sections']) as &$section) {
        $section['templateDirectory'] = "$className/$projectSlug";
      }
    }

    return $this->getPage(
      templateVars: [
        'title' => $project['title'],
        'metaDescription' => $project['description'],
        'onThisPage' => true,
      ],
      sections: $project['sections']
    );
  }
}
