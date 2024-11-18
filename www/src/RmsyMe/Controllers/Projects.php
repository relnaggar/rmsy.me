<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
  Routing\RouterInterface,
};
use RmsyMe\Services\Projects as ProjectsService;

class Projects extends AbstractController
{
  private ProjectsService $projectsService;
  private RouterInterface $router;

  public function __construct(
    array $decorators,
    ProjectsService $projectsService,
    RouterInterface $router
  ) {
    parent::__construct($decorators);
    $this->projectsService = $projectsService;
    $this->router = $router;
  }

  public function index(): Page
  {
    $projects = $this->projectsService->getProjects();
    
    // preload the thumbnails for all projects
    $preloadImages = array_map(
      fn($project) => $project->thumbnail,
      $projects
    );

    return $this->getPage(
      bodyTemplatePath: 'index',
      templateVars: [
        'title' => 'All Projects',
        'metaDescription' => 'A collection of programming and robotics '
        . 'projects I\'ve worked on over the years. Check out my work!',
        'preloadImages' => $preloadImages,
        'projects' => $projects,
      ],
    );
  }

  public function show(string $projectSlug): Page
  {
    $project = $this->projectsService->getProject($projectSlug);
    if ($project === null) {
      return $this->router->getPageNotFound()->getPage();
    }

    return $this->getPage(
      templateVars: [
        'title' => $project->title,
        'metaDescription' => $project->metaDescription,
        'onThisPage' => true,
        'preloadImages' => [$project->preloadImage],
      ],
      sections: $project->getSections(),
    );
  }
}
