<?php declare(strict_types=1);
namespace Project\Controllers;

class Home implements \Framework\ControllerInterface {
  public function index(): \Framework\Page {
    return \Framework\Page::with_layout(
      'Home/index',
      $title='Home',
      $metaDescription='This is the home page.'  
    );
  }
}
