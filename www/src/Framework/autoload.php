<?php

declare(strict_types=1);

require_once 'Config.php';

spl_autoload_register(function (string $className): void
{
    $sourceDirectory = \Framework\Config::getInstance()->get('sourceDirectory');
    $fileName = str_replace('\\', '/', $className) . '.php';
    $file = "$sourceDirectory/$fileName";
    if (file_exists($file)) {
        require_once $file;
    }
});
