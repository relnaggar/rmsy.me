<?php declare(strict_types=1);
namespace RMSY\Controllers;

use Framework\TemplateEngine;

class AutoJobGPT extends AbstractProject {
  public function __construct(TemplateEngine $templateEngine, array $menu, array $project) {
    parent::__construct($templateEngine=$templateEngine, $templateDir='/autojobgpt/', $menu=$menu, $project=$project);
  }


  public function introduction(): array {
    return $this->basic(__FUNCTION__, $meta=[
      'title' => $this->project['title'],
      'description' => 'A job application management portal that uses GPT-4 to tailor your resume and cover letter to each job. Never write a cover letter again!',
    ], $vars=[], $sections=[
      [
        'title' => 'Executive Summary',
        'id' => 'summary'
      ], [
        'title' => 'Live Demo',
        'id' => 'demo'
      ], [
        'title' => 'Source Code',
        'id' => 'source'
      ]
    ]);
  }
}