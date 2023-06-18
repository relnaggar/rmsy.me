<?php declare(strict_types=1);
namespace RMSY;
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
    $this->frontController = new \RMSY\Controllers\Front();
    $this->projects = $this->getProjects();
    $this->engineerMenu = $this->getEngineerMenu();
    $this->addProjectControllers();    
    $this->engineerController= new \RMSY\Controllers\Engineer($this->engineerMenu, $this->projects);
  }

  private function getProjects(): array {
    $projects = [
      'Website' => [
        'title' => 'My Mona Lisa: A Personal Website',
        'path' => '/projects/website/',
        'imagePath' => '/assets/img/website-project.png',
        'description' => "Find out how I gave birth to this technological tapestry of blood, tears and Dockerfiles: curiosity is better than regret!",
        'rootFunctionName' => 'introduction',
        'pages' => [
          'devops' => [
            'title' => 'DevOps'
          ],
          'back' => [
            'title' => 'Back-end'
          ],
          'front' => [
            'title' => 'Front-end'
          ],
          'takeaways' => [
            'title' => 'Takeaways'
          ]
        ]
      ],
      'Beetle' => [
        'title' => 'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
        'path' => '/projects/beetle/',
        'imagePath' => '/assets/img/robot-vs-beetle.jpg',
        'description' => "Robot vs beetle: who will be the ultimate fighting champion?",
        'rootFunctionName' => 'introduction'
      ],
      'SDP' => [
        'title' => 'Robo-Messi: When Silicon Met Soccer',
        'path' => '/projects/sdp/',
        'imagePath' => '/assets/img/robot-hug.jpg',
        'description' => "Robo-Messi wants a hug. Will you give him one?",
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
      $className = '\\RMSY\\Controllers\\' . $projectId;
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
