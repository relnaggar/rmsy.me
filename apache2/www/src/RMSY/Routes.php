<?php declare(strict_types=1);
namespace RMSY;
class Routes implements \Framework\RoutesInterface {  
  /* @var \Framework\TemplateEngine */
  private $templateEngine;

  /* @var \Controllers\Front */
  private $frontController;

  /* @var \Controllers\Engineer */
  private $engineerController;

  /* @var array */
  private $projects;

  /* @var array */
  private $engineerMenu;

  public function __construct(\Framework\TemplateEngine $templateEngine) {
    $this->templateEngine = $templateEngine;
    $this->projects = $this->getProjects();
    $this->engineerMenu = $this->getEngineerMenu();
    $this->addProjectControllers();    
    $this->engineerController= new \RMSY\Controllers\Engineer($templateEngine, $this->engineerMenu, $this->projects);
  }

  private function getProjects(): array {
    $projects = [
      'Website' => [
        'title' => 'My Mona Lisa: A Personal Website',
        'path' => '/projects/website/',
        'imagePath' => '/assets/img/front/responsive.gif',
        'description' => "Find out how I gave birth to this technological tapestry of blood, tears and Dockerfiles: curiosity is better than regret!",
        'rootFunctionName' => 'introduction',
        'pages' => [
          'back' => [
            'title' => 'Back-end'
          ],
          'front' => [
            'title' => 'Front-end'
          ],
          'devops' => [
            'title' => 'DevOps'
          ],
          'takeaways' => [
            'title' => 'Takeaways'
          ]
        ]
      ],
      'Beetle' => [
        'title' => 'Pooptimus Prime: The World\'s First Dung Beetle Biorobot',
        'path' => '/projects/beetle/',
        'imagePath' => '/assets/img/beetle/vs-robot.jpg',
        'description' => "Robot vs beetle: who will be the ultimate fighting champion?",
        'rootFunctionName' => 'introduction'
      ],
      'SDP' => [
        'title' => 'Robo-Messi: When Silicon Met Soccer',
        'path' => '/projects/sdp/',
        'imagePath' => '/assets/img/sdp/hug.jpg',
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
      $controller = new $className($this->templateEngine, $this->engineerMenu, $project);
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

    $engineerHomePath = '/';
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
          'path' => '/engineer/resume',
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
          'controller' => $this->engineerController,
          'functionName' => 'home'
        ]
        ],
      '/about' => [
        'GET' => [
          'controller' => $this->engineerController,
          'functionName' => 'about'
        ]
      ],
      '/contact' => [
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
