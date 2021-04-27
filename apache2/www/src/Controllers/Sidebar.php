<?php declare(strict_types=1);
namespace Controllers;
class Sidebar {
  public function website(): \Sidebar {
    $homePath = '/engineer/' . __FUNCTION__ . '/';
    return new \Sidebar(
      $title = 'Personal Website',
      $items = [
        [
          'text' => 'Introduction',
          'path' => $homePath
        ], [
          'text' => 'AWS',
          'path' => $homePath . 'aws'
        ], [
          'text' => 'Docker',
          'path' => $homePath . 'docker'
        ], [
          'text' => 'Apache',
          'path' => $homePath . 'apache'
        ], [
          'text' => 'Bash',
          'path' => $homePath . 'bash'
        ], [
          'text' => 'SSL',
          'path' => $homePath . 'ssl'
        ], [
          'text' => 'PostgreSQL',
          'path' => $homePath . 'postgres'
        ], [
          'text' => 'PHPUnit',
          'path' => $homePath . 'phpunit'
        ], [
          'text' => 'Selenium',
          'path' => $homePath . 'selenium'
        ], [
          'text' => 'Cucumber',
          'path' => $homePath . 'cucumber'
        ], [
          'text' => 'LaTeX',
          'path' => $homePath . 'latex'
        ], [
          'text' => 'Bootstrap',
          'path' => $homePath . 'bootstrap'
        ], [
          'text' => 'PHP Framework',
          'path' => $homePath . 'php'
        ], [
          'text' => 'Contact Form',
          'path' => $homePath . 'form'
        ], [
          'text' => 'Jira',
          'path' => $homePath . 'jira'
        ]
      ]
    );
  }
}
