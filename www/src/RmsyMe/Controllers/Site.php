<?php declare(strict_types=1);
namespace RmsyMe\Controllers;

use Framework\Controllers\AbstractController;
use Framework\Views\Page;

use RmsyMe\Data\Section;
use RmsyMe\Services\Projects;
use RmsyMe\Data\Image;

class Site extends AbstractController {
  private Projects $projectsService;

  public function __construct(array $decorators, Projects $projectsService) {
    parent::__construct($decorators);
    $this->projectsService = $projectsService;
  }

  public function index(): Page {
    $currentDate = new \DateTime();
    $tutoringStartDate = new \DateTime('2019-01-01');
    $numberOfYearsTutoring = $currentDate->diff($tutoringStartDate)->y;
    $formatter = new \NumberFormatter("en", \NumberFormatter::SPELLOUT);
    $numberOfYearsTutoringAsWord = ucfirst(
      $formatter->format($numberOfYearsTutoring)
    );

    $projects = $this->projectsService->getProjects();
    $thumbnails = array_map(fn($project) => $project->thumbnail, $projects);
    $preloadImages = array_slice($thumbnails, 0, 2);

    return $this->getPage(
      bodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Ramsey El-Naggar',
        'subtitle' => 'Software Engineer & Educator',
        'metaDescription' => "Hi, I'm Ramsey 👋." .
          "Welcome to my slice of the internet pie!",
        'numberOfYearsTutoringAsWord' => $numberOfYearsTutoringAsWord,
        'projects' => $projects,
        'preloadImages' => $preloadImages,
      ],
      sections: [
        new Section(
          id: 'intro',          
          templateDirectory: __FUNCTION__,
        ),
        new Section(
          id: 'callToAction',          
          templateDirectory: __FUNCTION__,
        ),
        new Section(
          id: 'projects',          
          templateDirectory: __FUNCTION__,
        ),
      ],
    );
  }

  public function about(): Page {
    $relativeTemplatePath = __FUNCTION__;
    $fullTemplateFilePath = $this->getFullTemplateFilePath(
      $relativeTemplatePath
    );
    $lastModifiedTimestamp = filemtime($fullTemplateFilePath);
    $lastModifiedDate = (new \DateTime())->setTimestamp($lastModifiedTimestamp);
    $lastModifiedDateFormatted = $lastModifiedDate->format('F Y');

    return $this->getPage(
      $relativeTemplatePath,
      [
        'title' => 'About',
        'metaDescription' => 'I\'m a software engineer. My specialty? ' .
          'Well, I dive into the depths of ' .
          'full-stack web application development.',
        'preloadImages' => [new Image('profile.jpg')],
        'lastModifiedDateFormatted' => $lastModifiedDateFormatted
      ]
    );
  }

  public function tutoring(): Page {
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Tutoring',
        'metaDescription' => '',
      ]
    );
  }

  public function pageNotFound(): Page {
    http_response_code(404);
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Page Not Found',
        'metaRobots' => 'noindex, nofollow'
      ]
    );
  }
}
