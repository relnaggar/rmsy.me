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
    $projects = $this->projectsService->getData();
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Projects Summary',
        'metaDescription' => '',
        'projects' => $projects,
        'preloadImages' => array_map(
          fn($project) => $project['thumbnail'],
          $projects
        ),
      ]
    );
  }

  public function show(string $projectSlug): Page {
    $project = $this->projectsService->getData()[$projectSlug];

    if (isset($project['sections'])) {
      foreach (($project['sections']) as &$section) {
        $section['templateDirectory'] = $this->getControllerName() .
          '/' . $projectSlug;
      }
    }

    return $this->getPage(
      templateVars: [
        'title' => $project['title'],
        'metaDescription' => $project['description'],
        'onThisPage' => true,
        'preloadImages' => [$project['preloadImage']],
      ],
      sections: $project['sections'],
    );
  }
}
