<?php declare(strict_types=1);
namespace RMSY\Controllers;

class Site extends \Framework\AbstractController {
  public function index(): \Framework\Page {
    $currentDate = new \DateTime();
    $tutoringStartDate = new \DateTime('2019-01-01');
    $numberOfYearsTutoring = $currentDate->diff($tutoringStartDate)->y;
    $formatter = new \NumberFormatter("en", \NumberFormatter::SPELLOUT);
    $numberOfYearsTutoringAsWord = ucfirst(
      $formatter->format($numberOfYearsTutoring)
    );

    return $this->get_page(
      __FUNCTION__,
      [
        'title' => 'Home',
        'metaDescription' => 'Hello there, I\'m Ramsey -- not just your ' .
          'average software engineer, but a virtuoso conducting symphonies ' .
          'of syntax and semicolons.',
        'numberOfYearsTutoringAsWord' => $numberOfYearsTutoringAsWord
      ]
    );
  }

  public function about(): \Framework\Page {
    global $frameworkConfig;

    $controllerName = (new \ReflectionClass($this))->getShortName();
    $templateFilePath = $frameworkConfig['sourceDirectory'] . '/' . 
      $frameworkConfig['templateRootDirectory'] . '/' . $controllerName . '/' .
      __FUNCTION__ . '.html.php';
    $lastModifiedTimestamp = filemtime($templateFilePath);
    $lastModifiedDate = (new \DateTime())->setTimestamp($lastModifiedTimestamp);
    $lastModifiedDateFormatted = $lastModifiedDate->format('F Y');

    return $this->get_page(
      __FUNCTION__,
      [
        'title' => 'About',
        'metaDescription' => 'My specialty? Well, I dive into the depths of ' .
          'full-stack web application development.',
        'lastModifiedDateFormatted' => $lastModifiedDateFormatted
      ]
    );
  }

  public function linkedin(): void {
    $this->redirect('https://www.linkedin.com/in/relnaggar/');
  }

  public function github(): void {
    $this->redirect('https://github.com/relnaggar');
  }

  public function pageNotFound(): \Framework\Page {
    return $this->get_page(
      __FUNCTION__,
      [
        'title' => 'Page Not Found',
        'metaRobots' => 'noindex, nofollow'
      ]
    );
  }
}
