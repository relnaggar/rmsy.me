<?php declare(strict_types=1);
namespace Framework\Services;

use Framework\Services\AbstractService;

abstract class AbstractServiceUser {
  protected $services=[];

  /**
   * Register a service. This service will be available via
   * $this->services[$name].
   * 
   * @param AbstractService $service The service to register
   * @param string $name The name of the service. If empty, the class name
   *   will be used.
   */
  public function registerService(
    AbstractService $service,
    string $name=''
  ): void {
    if (empty($name)) {
      $name = (new \ReflectionClass($service))->getShortName();
    }
    $this->services[$name] = $service;
  }
}