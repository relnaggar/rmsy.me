<?php

declare(strict_types=1);

spl_autoload_register(function (string $className): void
{
    $sourceDirectory = __DIR__;
    $fileName = str_replace('\\', '/', $className) . '.php';
    $file = "$sourceDirectory/$fileName";
    if (file_exists($file)) {
        require_once $file;
    }
});
