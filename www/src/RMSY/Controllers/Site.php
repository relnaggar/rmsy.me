<?php declare(strict_types=1);
namespace RMSY\Controllers;

use RMSY\Services\Menu;

class Site extends AbstractBase {
  public function __construct(Menu $menu) {
    $this->menu = $menu;
  }

  public function index(): \Framework\Page {
    return $this->get_controller_page_with_layout(
      __FUNCTION__,
      [
        'title' => 'Home',
        'metaDescription' => 'This is the home page.'
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
