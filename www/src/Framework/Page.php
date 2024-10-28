<?php declare(strict_types=1);
namespace Framework;

class Page {
  private string $htmlContent;

  // factory pattern used since PHP doesn't support method overloading
  private function __construct() {}

  public function get_html_content(): string {
    return $this->htmlContent;
  }

  /**
   * Create a new Page instance with the HTML content directly specified.
   *
   * @param string $htmlContent The HTML content for the Page.
   * @return Page A new Page instance with the specified HTML content.
   */
  public static function with_html_content(string $htmlContent): Page {
    $obj = new Page();
    $obj->htmlContent = $htmlContent;
    return $obj;
  }
}
