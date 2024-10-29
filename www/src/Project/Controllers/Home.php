<?php declare(strict_types=1);
namespace Project\Controllers;

use Project\Services\Menu;

class Home extends \Framework\AbstractController {
  private Menu $menu;

  public function __construct(Menu $menu) {
    $this->menu = $menu;
  }

  public function index(): \Framework\Page {
    return $this->get_controller_page_with_layout(
      __FUNCTION__,
      [
        'title' => 'Home',
        'metaDescription' => 'This is the home page.',
        'menu' => $this->menu->get_template_vars('Home')
      ]
    );
  }

  public function about(): \Framework\Page {
    return $this->get_controller_page_with_layout(
      __FUNCTION__,
      [
        'title' => 'About',
        'metaDescription' => 'This is the about page.',
        'menu' => $this->menu->get_template_vars('About')
      ]
    );
  }

  public function contact(): \Framework\Page {
    return $this->get_controller_page_with_layout(
      __FUNCTION__,
      [
        'title' => 'Contact',
        'metaDescription' => 'This is the contact page.',
        'menu' => $this->menu->get_template_vars('Contact')
      ]
    );
  }
}
