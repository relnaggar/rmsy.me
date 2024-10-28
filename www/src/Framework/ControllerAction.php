<?php declare(strict_types=1);
namespace Framework;

class ControllerAction {
    public readonly AbstractController $controller;
    public readonly string $action;

    public function __construct(
        AbstractController $controller,
        string $action
    ) {
        $this->controller = $controller;
        $this->action = $action;
    }
}
