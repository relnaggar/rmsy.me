<?php declare(strict_types=1);
namespace RmsyMe\Services;

use RmsyMe\Data\Nav as NavData;
use RmsyMe\Data\NavItem;
use RmsyMe\Services\Projects;

class Nav {
  private Projects $projectsService;
  private ContactMethods $contactMethodsService;

  public function __construct(
    Projects $projectsService,
    ContactMethods $contactMethodsService
  ) {
    $this->projectsService = $projectsService;
    $this->contactMethodsService = $contactMethodsService;
  }

  public function getNav(): NavData {
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
    $navItems=[];
    $navItems[] = new NavItem(text: 'Home', path: '/');
    $navItems[] = new NavItem(text: 'About', path: '/about');
    $navItems[] = $projectsItem;
    // $navItems[] = new NavItem(text: 'Tutoring', path: '/tutoring');
    $navItems[] = $resumesItem;
    // add each contact method to the nav
    foreach ($this->contactMethodsService->getData() as $contactMethod) {
      if ($contactMethod['inNav']) {
        $navItems[] = new NavItem(
          text: $contactMethod['title'],
          path: $contactMethod['href'],
          external: $contactMethod['external'] ?? false,
          icon: $contactMethod['icon'],
          inFooter: $contactMethod['inFooter'] ?? false,
        );
      }
    }
    $navItems[] = new NavItem(
      text: 'Contact',
      path: '/contact',
      icon: 'envelope',
      inFooter: true
    );

    // nav
    return new NavData(
      homePath: '/',
      title: 'software engineer',
      items: $navItems,
    );
  }
}
