<?php

return [
    'paths' => [
        'migrations' => '/var/migrations',
        'seeds'      => '/var/seeds',
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment'     => 'docker',
        'docker' => [
            'adapter' => 'sqlite',
            'name'    => '/var/db/database',
        ],
    ],
    'version_order' => 'creation'
];
