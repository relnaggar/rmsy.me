<?php declare(strict_types=1);
namespace RMSY\Services;

class Menu extends \Framework\Services\AbstractService {
  public function getMenuData(): array {
    return [
      'homePath' => '/',
      'title' => 'software engineer',
      'items' => [
        'home' => ['text' => 'Home', 'path' => '/'],
        'about' => ['text' => 'About', 'path' => '/about'],
        'projects' => ['text' => 'Projects'],
        // 'tutoring' => ['text' => 'Tutoring', 'path' => '/tutoring'],
        'resumes' => [
          'text' => 'Resumes',
          'dropdown' => [
            [
              'text' => 'Full Stack Developer',
              'path' => '/resumes/full-stack-developer',
              'target' => '_blank',
              'rel' => 'noopener noreferrer',
            ], [
              'text' => 'Tutor',
              'path' => '/resumes/tutor',
              'target' => '_blank',
              'rel' => 'noopener noreferrer',
            ],
          ],
        ],
        'github' => [
          'text' => 'GitHub',
          'path' => '/github',
          'target' => '_blank',
          'rel' => 'noopener noreferrer',
          'footerIcon' => 'github',
        ],
        'linkedin' => [
          'text' => 'Linkedin',
          'path' => '/linkedin',
          'target' => '_blank',
          'rel' => 'noopener noreferrer',
          'footerIcon' => 'linkedin',
        ],
        'contact' => [
          'text' => 'Contact',
          'path' => '/contact',
          'footerIcon' => 'envelope',
        ],
      ],
    ];
  }
}
