<?php declare(strict_types=1);

function autoload(string $className): void {
    $fileName = str_replace('\\', '/', $className) . '.php';
    $file = '../src/' . $fileName; 
    require $file;
}
spl_autoload_register('autoload');
