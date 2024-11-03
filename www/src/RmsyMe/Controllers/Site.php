<?php declare(strict_types=1);
namespace RmsyMe\Controllers;

use Framework\Controllers\AbstractController;
use Framework\Views\Page;
use Framework\Views\TemplateEngine;

class Site extends AbstractController {
  public function index(): Page {
    $currentDate = new \DateTime();
    $tutoringStartDate = new \DateTime('2019-01-01');
    $numberOfYearsTutoring = $currentDate->diff($tutoringStartDate)->y;
    $formatter = new \NumberFormatter("en", \NumberFormatter::SPELLOUT);
    $numberOfYearsTutoringAsWord = ucfirst(
      $formatter->format($numberOfYearsTutoring)
    );

    return $this->getPage(
      __FUNCTION__,
      [
        'title' => 'Home',
        'metaDescription' => "Hi, I'm Ramsey 👋 I'm a software engineer",
        'numberOfYearsTutoringAsWord' => $numberOfYearsTutoringAsWord,
        'snippets' => [
          [
            'title' => 'About',
            'html' => TemplateEngine::getSnippet('Site/about'),
            'href' => '/about',
          ],
        ],
      ]
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
        'metaDescription' => 'My specialty? Well, I dive into the depths of ' .
          'full-stack web application development.',
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
