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
      'title' => $title,
      'menu' => $this->menu,
      'sidebar' => $this->sidebar,
      'sections' => $sections
    ];
  }

  public function aws(): array {
    return $this->basic(__FUNCTION__, $vars=[], $title=strtoupper(__FUNCTION__));
  }

  public function docker(): array {
    return $this->basic(__FUNCTION__);
  }

  public function apache(): array {
    return $this->basic(__FUNCTION__);
  }

  public function bash(): array {
    return $this->basic(__FUNCTION__);
  }


  public function ssl(): array {
    return $this->basic(__FUNCTION__, $vars=[], $title=strtoupper(__FUNCTION__));
  }

  public function postgres(): array {
    return $this->basic(__FUNCTION__, $vars=[], $title='PostgreSQL');
  }

  public function phpunit(): array {
    return $this->basic(__FUNCTION__, $vars=[], $title='PHPUnit');
  }

  public function selenium(): array {
    return $this->basic(__FUNCTION__);
  }

  public function cucumber(): array {
    return $this->basic(__FUNCTION__);
  }

  public function latex(): array {
    return $this->basic(__FUNCTION__, $vars=[], $title='LaTeX');
  }

  public function bootstrap(): array {
    return $this->basic(__FUNCTION__);
  }

  public function php(): array {
    return $this->basic(__FUNCTION__, $vars=[], $title='PHP Framework');
  }

  public function form(): array {
    return $this->basic(__FUNCTION__, $vars=[], $title='Contact Form');
  }

  public function jira(): array {
    return $this->basic(__FUNCTION__);
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
