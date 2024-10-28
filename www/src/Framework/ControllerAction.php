<?php declare(strict_types=1);
namespace Framework;

class ControllerAction {
    public readonly ControllerInterface $controller;
    public readonly string $action;

    public function __construct(
        ControllerInterface $controller,
        string $action
    ) {
        $this->controller = $controller;
        $this->action = $action;
    }
}
