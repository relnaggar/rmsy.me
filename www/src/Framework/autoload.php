<?php declare(strict_types=1);

function autoload(string $className): void {
    global $frameworkConfig;
    $fileName = str_replace('\\', '/', $className) . '.php';
    $file = $frameworkConfig['sourceDirectory'] . '/' . $fileName; 
    if (file_exists($file)) {
        require $file;
    }
}
spl_autoload_register('autoload');
