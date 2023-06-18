<?php declare(strict_types=1);
namespace RMSY\Controllers;
class Front {
  public function home(): void {
    header('Location: /engineer/');
    die(); 
  }
}
