<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\Nav;
use App\Data\NavItem;
use Exception;

class NavService
{
    private array $navItems = [];
    private Nav $nav;

    public function __construct(
        private ProjectsService $projectsService,
        private ContactMethodsService $contactMethodsService,
    ) {
        $this->buildNav();
    }

    private function buildNav(): void
    {
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
        foreach ($this->projectsService->getProjects() as $project) {
            $projectsItem->addDropdownItem(new NavItem(
                text: $project->title,
                path: "/{$project->slug}",
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
        $this->addNavItem(new NavItem(text: 'Home', path: '/'));
        $this->addNavItem(new NavItem(text: 'About', path: '/about'));
        $this->addNavItem($projectsItem);
        $this->addNavItem($resumesItem);

        // add each contact method to the nav
        foreach ($this->contactMethodsService->getContactMethods() as $contactMethod) {
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
            text: 'Portal Login',
            path: '/portal/login',
            alignEnd: true,
        ));

        // portal nav (not in main menu)
        $portalItem = new NavItem(text: 'Portal', path: '/portal', inMenu: false);
        $portalItem->addDropdownItem(new NavItem(text: 'Dashboard', path: '/'));
        $portalItem->addDropdownItem(new NavItem(text: 'Payments', path: '/payments'));
        $portalItem->addDropdownItem(new NavItem(text: 'Buyers', path: '/buyers'));
        $portalItem->addDropdownItem(new NavItem(text: 'Clients', path: '/clients'));
        $portalItem->addDropdownItem(new NavItem(text: 'Students', path: '/students'));
        $portalItem->addDropdownItem(new NavItem(text: 'Lessons', path: '/lessons'));
        $portalItem->addDropdownItem(new NavItem(text: 'Logout', path: '/logout'));
        $this->addNavItem($portalItem);

        // nav
        $this->nav = new Nav(
            homePath: '/',
            title: 'Software Engineer & Educator',
            items: $this->navItems,
        );
    }

    private function addNavItem(NavItem $navItem): void
    {
        $this->navItems[] = $navItem;
    }

    public function getNav(): Nav
    {
        return $this->nav;
    }

    public function getNavForPath(string $path): Nav
    {
        $nav = clone $this->nav;
        $nav->setActiveItem($path);

        return $nav;
    }

    public function getNavItem(string $path): NavItem
    {
        foreach ($this->nav->items as $navItem) {
            if ($navItem->getPath() === $path) {
                return $navItem;
            }
        }
        throw new Exception("No nav item found for path: {$path}");
    }

    public function getSidebarNav(string $path): ?Nav
    {
        // Check if path matches a nav item with dropdown
        foreach ($this->nav->items as $navItem) {
            if ($navItem->isDropdown() && str_starts_with($path, $navItem->getPath())) {
                $sidebarNav = $navItem->getAsNav();
                $sidebarNav->setActiveItem($path);

                return $sidebarNav;
            }
        }

        return null;
    }
}
