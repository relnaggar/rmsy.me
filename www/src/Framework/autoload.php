<?php declare(strict_types=1);

spl_autoload_register(function (string $className): void {
    global $frameworkConfig;
    $fileName = str_replace('\\', '/', $className) . '.php';
    $file = $frameworkConfig['sourceDirectory'] . '/' . $fileName; 
    if (file_exists($file)) {
        require $file;
    }
});
