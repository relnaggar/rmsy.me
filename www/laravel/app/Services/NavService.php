<?php

declare(strict_types=1);

namespace App\Services;

use Exception;
use App\Data\Nav;
use App\Data\NavItem;

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
            path: route('projects.index'),
            previousNextButtonsEnabled: true,
        );
        $projectsItem->addDropdownItem(new NavItem(
            text: 'All Projects',
            path: route('projects.index'),
        ));
        foreach ($this->projectsService->getProjects() as $project) {
            $projectsItem->addDropdownItem(new NavItem(
                text: $project->title,
                path: route('projects.show', $project->slug),
            ));
        }

        // resumes dropdown
        $resumesItem = new NavItem(text: 'Resumes', path: url('/resumes'));
        $resumesItem->addDropdownItem(new NavItem(
            text: 'Full Stack Developer',
            path: url('/resumes/full-stack-developer'),
            external: true,
        ));
        $resumesItem->addDropdownItem(new NavItem(
            text: 'CS & SE Educator',
            path: url('/resumes/educator'),
            external: true,
        ));

        // nav items
        $this->addNavItem(new NavItem(text: 'Home', path: route('home')));
        $this->addNavItem(new NavItem(text: 'About', path: route('about')));
        $this->addNavItem($projectsItem);
        $this->addNavItem($resumesItem);

        // add each contact method to the nav
        foreach (
            $this->contactMethodsService->getContactMethods() as $contactMethod
        ) {
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
            path: route('contact.show'),
            icon: 'envelope',
            inFooter: true
        ));

        $this->addNavItem(new NavItem(
            text: 'Portal Login',
            path: route('login'),
            alignEnd: true,
        ));

        // portal nav (not in main menu)
        $portalItem = new NavItem(
            text: 'Portal',
            path: route('portal.dashboard'),
            inMenu: false
        );
        $portalItem->addDropdownItem(
            new NavItem(text: 'Dashboard', path: route('portal.dashboard'))
        );
        $portalItem->addDropdownItem(
            new NavItem(text: 'Payments', path: route('portal.payments.index'))
        );
        $portalItem->addDropdownItem(
            new NavItem(text: 'Buyers', path: route('portal.buyers.index'))
        );
        $portalItem->addDropdownItem(
            new NavItem(text: 'Clients', path: route('portal.clients.index'))
        );
        $portalItem->addDropdownItem(
            new NavItem(text: 'Students', path: route('portal.students.index'))
        );
        $portalItem->addDropdownItem(
            new NavItem(text: 'Lessons', path: route('portal.lessons.index'))
        );
        $portalItem->addDropdownItem(
            new NavItem(text: 'Logout', path: route('logout'))
        );
        $this->addNavItem($portalItem);

        // nav
        $this->nav = new Nav(
            homePath: route('home'),
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
            if (
                $navItem->isDropdown() &&
                str_starts_with($path, $navItem->getPath())
            ) {
                $sidebarNav = $navItem->getAsNav();
                $sidebarNav->setActiveItem($path);

                return $sidebarNav;
            }
        }

        return null;
    }
}
