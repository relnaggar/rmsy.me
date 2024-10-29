<?php declare(strict_types=1);
namespace RMSY\Controllers;

use RMSY\Services\Menu;

class Site extends AbstractBase {
  public function __construct(Menu $menu) {
    $this->menu = $menu;
  }

  public function index(): \Framework\Page {
    $currentDate = new \DateTime();
    $tutoringStartDate = new \DateTime('2019-01-01');
    $numberOfYearsTutoring = $currentDate->diff($tutoringStartDate)->y;
    $formatter = new \NumberFormatter("en", \NumberFormatter::SPELLOUT);
    $numberOfYearsTutoringAsWord = ucfirst(
      $formatter->format($numberOfYearsTutoring)
    );

    return $this->get_controller_page_with_layout(
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
    return $this->get_controller_page_with_layout(
      __FUNCTION__,
      [
        'title' => 'About',
        'metaDescription' => 'This is the about page.'
      ]
    );
  }

  public function contact(): \Framework\Page {
    return $this->get_controller_page_with_layout(
      __FUNCTION__,
      [
        'title' => 'Contact',
        'metaDescription' => 'This is the contact page.'
      ]
    );
  }

  public function pageNotFound(): \Framework\Page {
    return $this->get_controller_page_with_layout(
      __FUNCTION__,
      [
        'title' => 'Page Not Found',
        'metaRobots' => 'noindex, nofollow'
      ]
    );
  }
}
