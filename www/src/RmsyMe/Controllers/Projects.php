<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Framework\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\Services\Projects as ProjectsService;

class Projects extends AbstractController
{
  private ProjectsService $projectsService;

  public function __construct(
    array $decorators,
    ProjectsService $projectsService,
  ) {
    parent::__construct($decorators);
    $this->projectsService = $projectsService;
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
