<?php declare(strict_types=1);
namespace Framework;

interface ComponentInterface {
  /**
   * Render the component
   *
   * @return string The HTML of the component
   */
  public function render(): string;
}
