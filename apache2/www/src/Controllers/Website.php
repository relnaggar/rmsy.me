<?php declare(strict_types=1);
namespace Controllers;
class Website extends Segment {
  /* @var \Controllers\Sidebar */
  private $sidebar;

  public function __construct(\Controllers\Menu $menuController, \Controllers\Sidebar $sidebarController) {
    parent::__construct($templateDir='/website/', $menu=$menuController->engineer());
    $this->sidebar = $sidebarController->website();
    $this->menu['activeItemText'] = 'Website';
  }

  public function intro(): array {
    $title = "Introduction";
    $this->sidebar->setActiveItemText($title);
    return [
      'title' => $title,
      'menu' => $this->menu,
      'sidebar' => $this->sidebar,
      'html' => loadTemplate($this->templateDir . __FUNCTION__)
    ];
  }

  public function aws(): array {
    $title = "AWS";
    $this->sidebar->setActiveItemText($title);
    return [
      'title' => $title,
      'menu' => $this->menu,
      'sidebar' => $this->sidebar,
      'html' => loadTemplate($this->templateDir . __FUNCTION__)
    ];
  }

  //public function feature1(): array {
    //$title = "Feature 1";
    //$this->sidebar->setActiveItemText($title);

    //$sections = [
      //[
        //'title' => 'Section 1',
        //'id' => 'section-1',
        //'html' => loadTemplate($this->templateDir . __FUNCTION__)
      //]
    //];

    //return [
      //'title' => $title,
      //'menu' => $this->menu,
      //'sidebar' => $this->sidebar,
      //'sections' => $sections
    //];
  //}

  //public function feature2(): array {
    //$title = "Feature 2";
    //$this->sidebar->setActiveItemText($title);

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

    //return [
      //'title' => $title,
      //'menu' => $this->menu,
      //'sidebar' => $this->sidebar,
      //'sections' => $sections
    //];
  //}
}
