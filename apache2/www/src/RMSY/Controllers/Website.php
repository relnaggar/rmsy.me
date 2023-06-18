<?php declare(strict_types=1);
namespace RMSY\Controllers;
class Website extends Project {
  /* @var string */
  private const REPOSITORY_URL = 'https://github.com/relnaggar/rmsy.me/blob/master/';

  /* @var string */
  private const PUBLIC_URL = 'apache2/www/public/';

  public function __construct(array $menu, array $project) {
    parent::__construct($templateDir='/website/', $menu=$menu, $project=$project);
  }

  public function introduction(): array {
    return $this->basic(__FUNCTION__, $meta=[], $vars=[], $sections=[
        [
          'title' => 'Executive Summary',
          'id' => 'summary'
        ], [
          'title' => 'Purpose',
          'id' => 'purpose'
        ], [
          'title' => 'Skills',
          'id' => 'skills'
        ], [
          'title' => 'Source code',
          'id' => 'source'
        ]
      ]
    );
  }

  public function devops(): array {
    return $this->basic(__FUNCTION__, $meta=['noindex' => true]);
  }

  public function back(): array {
    global $sourceDirectory, $frameworkDirectory;
    $publicUrl = self::REPOSITORY_URL . self::PUBLIC_URL;
    $sourceUrl = $publicUrl . $sourceDirectory;
    $frameworkUrl = $sourceUrl . $frameworkDirectory;
    $controllersUrl = $sourceUrl . __NAMESPACE__ . '/';
    
    return $this->basic(__FUNCTION__, $meta=[], $vars=[
      'publicUrl' => $publicUrl,
      'frameworkUrl' => $frameworkUrl,
      'controllersUrl' => $controllersUrl
    ], $sections=[
      [
        'title' => 'Boring Technical Summary',
        'id' => 'summary'
      ], [
        'title' => 'Boarding The Website Train: Laying the Framework',
        'id' => 'framework'
      ], [
        'title' => 'Vroom Vroom: The Template Engine',
        'id' => 'templating'
      ], [
        'title' => 'The Puppet Masters: Controllers',
        'id' => 'controllers'
      ], [
        'title' => 'Navigating the Maze: The Menu and Sidebar System',
        'id' => 'navigation'
      ], [
        'title' => 'Say Hello: The Contact Form',
        'id' => 'contactForm'
      ], [
        'title' => 'Lessons from the Frontier',
        'id' => 'lessons'
      ]
    ]
  );
  }

  public function front(): array {
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
