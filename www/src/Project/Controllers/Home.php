<?php declare(strict_types=1);
namespace Project\Controllers;

class Home implements \Framework\ControllerInterface {
  public function index(): \Framework\Page {
    return \Framework\Page::with_template('layout', [
      'title' => 'Home',
      'metaDescription' => 'This is the home page.',
      'bodyContent' => '<div class="container">
        Hello World!
        <i class="bi bi-bootstrap"></i>
      </div>'
    ]);
  }
}
