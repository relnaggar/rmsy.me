<?php declare(strict_types=1);
namespace Framework\Routing;

use Framework\Controllers\RedirectController;

class Redirect extends ControllerAction {
  /**
   * Create a new Redirect instance that redirects to the specified URL.
   *
   * @param string $url The URL to redirect to.
   */
  public function __construct(string $url) {
    parent::__construct(RedirectController::class, 'doRedirect', [$url]);
  }
}
