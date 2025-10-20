<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\{
  Services\Projects,
  Data\Image,
};

class Site extends AbstractController
{
  private Projects $projectsService;

  public function __construct(array $decorators, Projects $projectsService)
  {
    parent::__construct($decorators);
    $this->projectsService = $projectsService;
  }

  public function index(): Page
  {
    // calculate the number of years tutoring
    $currentDate = new \DateTime();
    $tutoringStartDate = new \DateTime('2019-01-01');
    $numberOfYearsTutoring = $currentDate->diff($tutoringStartDate)->y;
    $formatter = new \NumberFormatter("en", \NumberFormatter::SPELLOUT);
    $numberOfYearsTutoringAsWord = ucfirst(
      $formatter->format($numberOfYearsTutoring)
    );

    // get the featured projects
    $projects = $this->projectsService->getProjects();
    $featuredProjects = array_filter(
      $projects,
      fn($project) => $project->featured
    );

    // define the roles data
    $freeMeetingCallToAction = [
      'href' => '/free-meeting',
      'external' => true,
      'text' => 'Book a free meeting',
      'btn-type' => 'cta',
    ];
    $roles = [
      [
        'header' => 'Ramsey the Engineer',
        'content' => <<<HTML
          I'm a software engineer, specialising in
          <strong>full-stack web application development</strong>.
          That means I can take your wildest web dreams and turn them into
          reality, quickly.
        HTML,
        'callsToAction' => [
          [
            // 'href' => '/services/engineer',
            'href' => '/projects/',
            'external' => false,
            // 'text' => 'Learn more about my engineering services',
            'text' => 'Learn more about my engineering projects',
            'btn-type' => 'primary',
          ],
          [
            'href' => '/resumes/full-stack-developer',
            'external' => true,
            'text' => 'View my full stack developer resume',
            'btn-type' => 'success',
          ],
          $freeMeetingCallToAction,
        ],
        'icon' => 'terminal-fill',
      ], [
        'header' => 'Ramsey the Educator',
        'content' => <<<HTML
          As an educator, I love to
          <strong>share my knowledge and passion for programming</strong>.
          From beginner to code conjurer, I can help boost your confidence and
          results.
        HTML,
        'callsToAction' => [
          [
            // 'href' => '/services/educator',
            // 'external' => false,
            'href' => 'https://www.mytutor.co.uk/tutors/24851/',
            'external' => true,
            'text' => 'Learn more about my educational services',
            'btn-type' => 'primary',
          ],
          [
            'href' => '/resumes/educator',
            'external' => true,
            'text' => 'View my educator resume',
            'btn-type' => 'success',
          ],
          $freeMeetingCallToAction,
        ],
        'icon' => 'mortarboard-fill',
      ]
    ];

    return $this->getPage(
      bodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Ramsey El-Naggar',
        'subtitle' => 'Software Engineer & Educator',
        'metaDescription' => "Hi, I'm Ramsey 👋. " .
          'Welcome to my slice of the internet pie!',
        'numberOfYearsTutoringAsWord' => $numberOfYearsTutoringAsWord,
        'featuredProjects' => $featuredProjects,
        'roles' => $roles,
      ],
    );
  }

  public function about(): Page
  {
    // get the last modified date of the template
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

  public function pageNotFound(): Page
  {
    http_response_code(404);
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Page Not Found',
        'metaRobots' => 'noindex, nofollow'
      ]
    );
  }

  public function databaseError(): Page
  {
    http_response_code(500);
    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Database Error',
        'metaRobots' => 'noindex, nofollow'
      ]
    );
  }

  public function wiseDeposit(): Page
  {
    error_log('Received Wise deposit webhook v2');
    $raw = file_get_contents('php://input');
    error_log($raw);
    $headers = getallheaders();
    error_log(print_r($headers, true));
    return Page::empty();
  }
}
