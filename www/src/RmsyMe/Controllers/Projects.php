<?php declare(strict_types=1);
namespace RmsyMe\Controllers;

use Framework\Controllers\AbstractController;
use Framework\Views\Page;

use RmsyMe\Services\Projects as ProjectsService;

class Projects extends AbstractController {
  private ProjectsService $projectsService;

  public function __construct(
    array $decorators,
    ProjectsService $projectsService
  ) {
    parent::__construct($decorators);
    $this->projectsService = $projectsService;
  }

  public function index(): Page {
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Projects Summary',
        'metaDescription' => '',
        'projects' => $this->projectsService->getData(),
      ]
    );
  }

  public function show(string $projectSlug): Page {
    $project = $this->projectsService->getData()[$projectSlug];

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
