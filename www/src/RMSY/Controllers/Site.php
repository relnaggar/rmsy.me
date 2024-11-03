<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\Views\Page;

class Site extends \Framework\Controllers\AbstractController {
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
        'metaDescription' => 'Hello there, I\'m Ramsey -- not just your ' .
          'average software engineer, but a virtuoso conducting symphonies ' .
          'of syntax and semicolons.',
        'numberOfYearsTutoringAsWord' => $numberOfYearsTutoringAsWord,
        'snippets' => [
          [
            'title' => 'About',
            'html' => \Framework\Views\TemplateEngine::getSnippet('Site/about'),
            'href' => '/about',
          ],
        ],
      ]
    );
  }

  public function about(): Page {
    global $frameworkConfig;

    $controllerName = (new \ReflectionClass($this))->getShortName();
    $templateFilePath = $frameworkConfig['sourceDirectory'] . '/' . 
      $frameworkConfig['templateRootDirectory'] . '/' . $controllerName . '/' .
      __FUNCTION__ . '.html.php';
    $lastModifiedTimestamp = filemtime($templateFilePath);
    $lastModifiedDate = (new \DateTime())->setTimestamp($lastModifiedTimestamp);
    $lastModifiedDateFormatted = $lastModifiedDate->format('F Y');

    return $this->getPage(
      __FUNCTION__,
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
