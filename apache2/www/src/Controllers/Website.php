<?php declare(strict_types=1);
namespace Controllers;
class Website extends Project {
  public function __construct(array $menu, array $project) {
    parent::__construct($templateDir='/website/', $menu=$menu, $project=$project);
  }

  public function introduction(): array {
    $description = "This project is the website you are about to view!";
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
      'meta' => ['title' => $title, 'description' => $description],
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

  public function bootstrap(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
  }

  public function php(): array {
    return $this->basic(__FUNCTION__, $meta=['title' => strtoupper(__FUNCTION__), 'noindex' => true]);
  }

  public function contactForm(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
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
