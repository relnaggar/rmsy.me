<?php declare(strict_types=1);
namespace Project\Controllers;

class Home implements \Framework\ControllerInterface {
  public function index(): \Framework\Page {
    return \Framework\Page::with_html_content(
      '<h1>Hello world!</h1>'
    );
  }
}
