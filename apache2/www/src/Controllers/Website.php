<?php declare(strict_types=1);
namespace Controllers;
class Website extends Segment {
  public function __construct(\Controllers\Menu $menuController, \Controllers\Sidebar $sidebarController) {
    parent::__construct($templateDir='/website/', $menu=$menuController->engineer(), $sidebar=$sidebarController->website());
    $this->menu['activeItemText'] = 'Website';
  }

  public function introduction(): array {
    $title = $this->getTitle(__FUNCTION__);
    $this->sidebar->setActiveItemText($title);

    $sections = [
      [
        'title' => 'Project purpose',
        'id' => 'purpose',
        'html' => loadTemplate($this->templateDir . __FUNCTION__ . '/purpose')
      ], [
        'title' => 'Web-development skills',
        'id' => 'skills',
        'html' => loadTemplate($this->templateDir . __FUNCTION__ . '/skills')
      ], [
        'title' => 'Source code',
        'id' => 'source',
        'html' => loadTemplate($this->templateDir . __FUNCTION__ . '/source')
      ]
    ];

    return [
      'meta' => ['title' => $title],
      'menu' => $this->menu,
      'sidebar' => $this->sidebar,
      'sections' => $sections
    ];
  }

  public function aws(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => strtoupper(__FUNCTION__), 'noindex' => true]);
  }

  public function docker(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
  }

  public function apache(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
  }

  public function bash(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
  }


  public function ssl(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => strtoupper(__FUNCTION__), 'noindex' => true]);
  }

  public function postgres(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => 'PostgreSQL', 'noindex' => true]);
  }

  public function phpunit(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => 'PHPUnit', 'noindex' => true]);
  }

  public function selenium(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
  }

  public function cucumber(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
  }

  public function bootstrap(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
  }

  public function php(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => 'PHP Framework', 'noindex' => true]);
  }

  public function form(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => 'Contact Form', 'noindex' => true]);
  }

    //$sections = [
      //[
        //'title' => 'Section 1',
        //'id' => 'section-1',
        //'html' => loadTemplate($this->templateDir . __FUNCTION__),
        //'subsections' => [
          //[
            //'title' => 'A',
            //'id' => 'a',
            //'html' => loadTemplate($this->templateDir . __FUNCTION__ . '-a')
          //], [
            //'title' => 'B',
            //'id' => 'b',
            //'html' => loadTemplate($this->templateDir . __FUNCTION__ . '-b')
          //]
        //]
      //]
    //];
}
