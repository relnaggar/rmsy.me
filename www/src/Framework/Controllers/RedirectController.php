<?php declare(strict_types=1);
namespace Framework\Controllers;

class RedirectController extends AbstractController {
  private readonly string $url;

  /**
   * This shouldn't be used outside of the framework. Use
   * \Framework\Routing\Redirect instead.
   */
  public function __construct(string $url) {
    $this->url = $url;
  }

  public function doRedirect(): void {
    $this->redirect($this->url);
  }
}
