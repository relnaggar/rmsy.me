<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use Relnaggar\Veloz\Routing\RouterInterface;
use RmsyMe\Data\{
  Nav as NavData,
  NavItem,
};

class Nav
{
  private RouterInterface $router;
  private Projects $projectsService;
  private ContactMethods $contactMethodsService;
  private array $navItems;
  private NavData $nav;

  public function __construct(
    RouterInterface $router,
    Projects $projectsService,
    ContactMethods $contactMethodsService,
  ) {
    $this->router = $router;
    $this->projectsService = $projectsService;
    $this->contactMethodsService = $contactMethodsService;

    // projects dropdown
    $projectsItem = new NavItem(
      text: 'Projects',
      path: '/projects',
      previousNextButtonsEnabled: true,
    );
    $projectsItem->addDropdownItem(new NavItem(
      text: 'All Projects',
      path: '/',
    ));
    // add each project to the projects dropdown
    foreach ($this->projectsService->getProjects() as $project) {
      $projectsItem->addDropdownItem(new NavItem(
        text: $project->title,
        path: "/$project->slug",
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
      text: 'CS & SE Educator',
      path: '/educator',
      external: true,
    ));

    // nav items
    $this->navItems = [];
    $this->addNavItem(new NavItem(text: 'Home', path: '/'));
    $this->addNavItem(new NavItem(text: 'About', path: '/about'));
    $this->addNavItem($projectsItem);
    $this->addNavItem($resumesItem);

    // add each contact method to the nav
    $contactMethods = $this->contactMethodsService->getContactMethods();
    foreach ($contactMethods as $contactMethod) {
      $this->addNavItem(new NavItem(
        text: $contactMethod['title'],
        path: $contactMethod['href'],
        external: $contactMethod['external'] ?? false,
        icon: $contactMethod['icon'],
        inMenu: $contactMethod['inMenu'] ?? false,
        inFooter: $contactMethod['inFooter'] ?? false,
      ));
    }

    $this->addNavItem(new NavItem(
      text: 'Contact',
      path: '/contact',
      icon: 'envelope',
      inFooter: true
    ));

    $this->addNavItem(new NavItem(
      text: 'Client Login',
      path: '/client/login',
      alignEnd: true,
    ));
    
    // add client side nav (not in main menu)
    $clientItem = new NavItem(text: 'Client', path: '/client', inMenu: false);
    $clientItem->addDropdownItem(new NavItem(
      text: 'Welcome',
      path: '/',
    ));
    $clientItem->addDropdownItem(new NavItem(
      text: 'Logout',
      path: '/logout',
    ));
    $this->addNavItem($clientItem);

    // nav
    $this->nav = new NavData(
      homePath: '/',
      title: 'Software Engineer & Educator',
      items: $this->navItems,
    );
  }

  private function addNavItem(NavItem $navItem): void
  {
    $hasPath = false;
    if ($this->router->hasPath($navItem->getPath())) {
      $hasPath = true;
    } else {
      foreach ($navItem->getDropdownItems() as $dropdownItem) {
        if ($this->router->hasPath($dropdownItem->getPath())) {
          $hasPath = true;
        } else {
          // remove dropdown item if it doesn't have a route
          $navItem->removeDropdownItem($dropdownItem);
        }
      }
    }
    if ($hasPath) {
      // only add nav item if it has a route
      $this->navItems[] = $navItem;
    }
  }

  public function getNav(): NavData
  {
    return $this->nav;
  }

  public function getNavItem(string $path): NavItem
  {
    foreach ($this->nav->items as $navItem) {
      if ($navItem->getPath() === $path) {
        return $navItem;
      }
    }
    throw new \Exception("No nav item found for path: $path");
  }
}
