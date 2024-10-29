<?php declare(strict_types=1);
namespace RMSY\Controllers;

use RMSY\Services\Menu;
use RMSY\Services\Media;

abstract class AbstractBase extends \Framework\AbstractController {
  protected Menu $menu;
  protected Media $media;

  public function get_controller_page_with_layout(
    string $bodyTemplatePath,
    array $templateVars=[],
    string $layoutTemplatePath='layout'
  ): \Framework\Page {
    if (isset($this->menu)) {
      $templateVars['menu'] = $this->menu->get_template_vars(
        $templateVars['title']
      );
    }
    if (isset($this->media)) {
      $templateVars['mediaRoot'] = $this->media->get_media_root();
    }
    if (isset($templateVars['title'])) {
      $templateVars['h1'] = $templateVars['title'];
      $templateVars['title'] .= ' | Ramsey El-Naggar';      
    }
    return parent::get_controller_page_with_layout(
      $bodyTemplatePath,
      $templateVars,
      $layoutTemplatePath
    );
  }
}