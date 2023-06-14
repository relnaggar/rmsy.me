<?php declare(strict_types=1);
class Routes implements \Framework\RoutesInterface {  
  /* @var \Controllers\Front */
  private $frontController;

  /* @var \Controllers\Engineer */
  private $engineerController;

  /* @var array */
  private $projects;

  /* @var array */
  private $engineerMenu;

  public function __construct() {
    $this->frontController = new \Controllers\Front();
    $this->projects = $this->getProjects();
    $this->engineerMenu = $this->getEngineerMenu($this->projects);
    $this->addProjectControllers();    
    $this->engineerController= new \Controllers\Engineer($this->engineerMenu, $this->projects);
  }

  private function getProjects(): array {
    $projects = [
      'Website' => [
        'title' => 'Personal Website',
        'path' => '/engineer/website/',
        'imagePath' => '/assets/img/hero-shot.jpg',
        'description' => "Find out how I made this website from scratch.",
        'rootFunctionName' => 'introduction',
        'pages' => [
          'aws' => [
            'title' => 'AWS'
          ],
          'docker' => [
            'title' => 'Docker'
          ],
          'apache' => [
            'title' => 'Apache'
          ],
          'bash' => [
            'title' => 'Bash'
          ],
          'bootstrap' => [
            'title' => 'Bootstrap'
          ],
          'php' => [
            'title' => 'PHP'
          ],
          'contactForm' => [
            'title' => 'Contact Form'
          ]
        ]
      ],
      'Beetle' => [
        'title' => 'Dung Beetle Biorobot',
        'path' => '/engineer/beetle/',
        'imagePath' => '/assets/img/hero-shot.jpg',
        'description' => "Beetle vs man vs robot: who will win?",
        'rootFunctionName' => 'introduction'
      ]
    ];
    foreach ($projects as &$project) {
      if (isset($project['pages'])) {
        foreach ($project['pages'] as $pagePath => &$page) {
          $page['path']=$project['path'] . $pagePath;
        }
      }
    }
    return $projects;
  }

  private function addProjectControllers() {
    foreach ($this->projects as $projectId => &$project) {
      $className = '\\Controllers\\' . $projectId;
      $controller = new $className($this->engineerMenu, $project);
      $project['controller'] = $controller;
    }
  }

  private function getEngineerMenu(): array {
    $projectsDropdown = [];
    foreach ($this->projects as $project) {
      $projectsDropdown[] = [
        'text' => $project['title'],
        'path' => $project['path'],
      ];
    }

    $engineerHomePath = '/engineer/';
    $engineerMenu = [
      'title' => 'software engineer',
      'homePath' => $engineerHomePath,
      'items' => [
        [
          'text' => 'Home',
          'path' => $engineerHomePath
        ], [
          'text' => 'About',
          'path' => $engineerHomePath . 'about'
        ], [
          'text' => 'Projects',
          'id' => 'projects',
          'dropdown' => $projectsDropdown
        ], [
          'text' => 'Resume',
          'path' => $engineerHomePath . 'resume',
          'target' => '_blank'
        ], [
          'text' => 'Linkedin',
          'path' => '/linkedin',
          'target' => '_blank'
        ], [
          'text' => 'Contact',
          'path' => $engineerHomePath . 'contact'
        ]
      ]
    ];

    return $engineerMenu;
  }

  public function getRoutes(): array {
    $routes = [
      '/' => [
        'GET' => [
          'controller' => $this->frontController,
          'functionName' => 'home'
        ]
      ],
      '/engineer/' => [
        'GET' => [
          'controller' => $this->engineerController,
          'functionName' => 'home'
        ]
      ],
      '/engineer/about' => [
        'GET' => [
          'controller' => $this->engineerController,
          'functionName' => 'about'
        ]
      ],
      '/engineer/contact' => [
        'GET' => [
          'controller' => $this->engineerController,
          'functionName' => 'contact'
        ],
        'POST' => [
          'controller' => $this->engineerController,
          'functionName' => 'contact'
        ]
      ]
    ];

    foreach ($this->projects as $project) {
      $projectRoutes = [
        $project['path'] => [
          'GET' => [
            'controller' => $project['controller'],
            'functionName' => $project['rootFunctionName']
          ]
        ]
      ];
      if (isset($project['pages'])) {
        foreach ($project['pages'] as $pagePath => $page) {
          $projectRoutes[$page['path']] = [
            'GET' => [
              'controller' => $project['controller'],
              'functionName' => $pagePath
            ]
          ];
        }
      }
      $routes = array_merge($routes, $projectRoutes);
    }
    // echo '<pre>'; var_dump($routes); echo '</pre>'; exit();
    return $routes;
  }

  public function getDefaultRoute(): array {
    http_response_code(404);
    return [
      'controller' => $this->engineerController,
      'functionName' => 'pageNotFound'
    ];
  }
}
