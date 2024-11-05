<?php declare(strict_types=1);
namespace RmsyMe\Services;

use Framework\Routing\RouterInterface;

use RmsyMe\Data\Nav as NavData;
use RmsyMe\Data\NavItem;

class Nav {
  private RouterInterface $router;
  private Projects $projectsService;
  private ContactMethods $contactMethodsService;
  private array $navItems;

  public function __construct(
    RouterInterface $router,
    Projects $projectsService,
    ContactMethods $contactMethodsService,
  ) {
    $this->router = $router;
    $this->projectsService = $projectsService;
    $this->contactMethodsService = $contactMethodsService;
    $this->navItems = [];
    $this->initialiseData();
  }

  private function initialiseData(): void {
    // projects dropdown
    $projectsItem = new NavItem(text: 'Projects', path: '/projects');
    $projectsItem->addDropdownItem(new NavItem(
      text: 'Projects Summary',
      path: '/',
    ));
    // add each project to the projects dropdown
    $projectsData = $this->projectsService->getData();
    foreach ($projectsData as $projectSlug => $projectData) {
      $projectsItem->addDropdownItem(new NavItem(
        text: $projectData['title'],
        path: "/$projectSlug",
      ));
    }

    // resumes dropdown    
    $resumesItem = new NavItem(text: 'Resumes', path: '/resumes');
    $resumesItem->addDropdownItem(new NavItem(
      text: 'Full Stack Developer',
      path: '/full-stack-developer',
      external: true,
    ));
    $resumesItem->addDropdownItem(new NavItem(
      text: 'Tutor',
      path: '/tutor',
      external: true,
    ));

    // nav items
    $this->addNavItem(new NavItem(text: 'Home', path: '/'));
    $this->addNavItem(new NavItem(text: 'About', path: '/about'));
    $this->addNavItem($projectsItem);
    $this->addNavItem(new NavItem(text: 'Tutoring', path: '/tutoring'));
    $this->addNavItem($resumesItem);
    // add each contact method to the nav
    foreach ($this->contactMethodsService->getData() as $contactMethod) {
      if ($contactMethod['inNav']) {
        $this->addNavItem(new NavItem(
          text: $contactMethod['title'],
          path: $contactMethod['href'],
          external: $contactMethod['external'] ?? false,
          icon: $contactMethod['icon'],
          inFooter: $contactMethod['inFooter'] ?? false,
        ));
      }
    }
    $this->addNavItem(new NavItem(
      text: 'Contact',
      path: '/contact',
      icon: 'envelope',
      inFooter: true
    ));
  }

  private function addNavItem(NavItem $navItem): void {
    $hasPath = false;
    if ($this->router->hasPath($navItem->getPath())) {
      $hasPath = true;
    } else {
      foreach ($navItem->getDropdownItems() as $dropdownItem) {
        if ($this->router->hasPath($dropdownItem->getPath())) {
          $hasPath = true;
        } else {
          $navItem->removeDropdownItem($dropdownItem);
        }
      }
    }
    if ($hasPath) {
      $this->navItems[] = $navItem;
    }
  }

  public function getData(): NavData {
    return new NavData(
      homePath: '/',
      title: 'software engineer',
      items: $this->navItems,
    );
  }
}
