<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\TemplateEngine;

class Website extends AbstractProject {
  /* @var string */
  private const REPOSITORY_URL = 'https://github.com/relnaggar/rmsy.me/blob/master/';

  /* @var string */
  private const PUBLIC_URL = 'apache2/www/public/';

  public function __construct(TemplateEngine $templateEngine, array $menu, array $project) {
    parent::__construct($templateEngine=$templateEngine, $templateDir='/website/', $menu=$menu, $project=$project);
  }

  public function introduction(): array {
    return $this->basic(__FUNCTION__, $meta=[
      'description' => 'Don\'t miss out on this coding rodeo! Ride into the sunset with this software engineer\'s personal website project, showcasing a wild west of back-end, front-end, and DevOps skills.'
    ], $vars=[], $sections=[
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
    return $this->basic(__FUNCTION__, $meta=[
        'noindex' => true
      ], $vars=[], $sections=[
        [
          'title' => 'Technical Highlights',
          'id' => 'highlights'
        ], [
          'title' => 'Birth of a Cloud Whisperer',
          'id' => 'cloud'
        ], [
          'title' => 'When Docker Met Swarm',
          'id' => 'docker'
        ], [
          'title' => 'Acing Apache: My Security Report Card',
          'id' => 'apache'
        ], [
          'title' => 'Bashing Out Some Scripts',
          'id' => 'bash'
        ], [
          'title' => 'Testing: Is This Thing On?',
          'id' => 'testing'
        ]
      ]
    );
  }

  public function back(): array {
    global $sourceDirectory, $frameworkDirectory;
    $publicUrl = self::REPOSITORY_URL . self::PUBLIC_URL;
    $sourceUrl = $publicUrl . $sourceDirectory;
    $frameworkUrl = $sourceUrl . $frameworkDirectory;
    $controllersUrl = $sourceUrl . __NAMESPACE__ . '/';
    
    return $this->basic(__FUNCTION__, $meta=[
      'description' => 'Explore the backstage of a website\'s back-end! From PHP framework creation to template engine implementation, controller hierarchy setup, and contact form engineering. Join this thrilling dive into PHP single-page application development!'
    ], $vars=[
      'publicUrl' => $publicUrl,
      'frameworkUrl' => $frameworkUrl,
      'controllersUrl' => $controllersUrl
    ], $sections=[
      [
        'title' => 'Technical Highlights',
        'id' => 'highlights'
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
      ]
    ]
  );
  }

  public function front(): array {
    return $this->basic(__FUNCTION__, $meta=['description' => 'Roll into the digital dining room that is the front-end of this website. Savour the ambiance, admire the decor, peruse the menu, and hey, don\'t forget to wink at that charming server.']);
  }

  public function takeaways(): array {
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
