<?php declare(strict_types=1);

function autoload(string $className): void {
    global $sourceDirectory;
    $fileName = str_replace('\\', '/', $className) . '.php';
    $file = $sourceDirectory . $fileName; 
    require $file;
}
spl_autoload_register('autoload');
