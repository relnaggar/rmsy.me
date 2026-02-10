<?php

declare(strict_types=1);

namespace App\Services;

class ContactMethodsService
{
    private array $contactMethods = [];

    public function __construct()
    {
        $this->contactMethods = [
            [
                'title' => 'Free meeting',
                'icon' => 'calendar3',
                'href' => url('/free-meeting'),
                'html' => 'rmsy.me/free-meeting',
                'external' => true,
                'inMenu' => false,
                'inFooter' => true,
                'cta' => true,
            ],
            [
                'title' => 'Email',
                'icon' => 'envelope',
                'href' => 'mailto:ramsey.el-naggar@outlook.com',
                'external' => true,
                'html' => 'ramsey.el&#8209;naggar@outlook.com',
                'inMenu' => false,
                'inFooter' => false,
            ],
            [
                'title' => 'GitHub',
                'icon' => 'github',
                'href' => url('/github'),
                'html' => 'rmsy.me/github',
                'external' => true,
                'inMenu' => true,
                'inFooter' => true,
            ],
            [
                'title' => 'LinkedIn',
                'icon' => 'linkedin',
                'href' => url('/linkedin'),
                'html' => 'rmsy.me/linkedin',
                'external' => true,
                'inMenu' => true,
                'inFooter' => true,
            ],
        ];
    }

    public function getContactMethods(): array
    {
        return $this->contactMethods;
    }
}
