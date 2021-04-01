<?php declare(strict_types=1);

class FrontController {
  public function home(): void {
    header('Location: /engineer/');
    die(); 
  }
}
