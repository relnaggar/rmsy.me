<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Relnaggar\Veloz\{
  Data\AbstractFormData,
  Routing\RouterInterface,
};
use RmsyMe\{
  Services\LoginService,
  Repositories\StudentRepository,
  Models\StudentModel,
  Repositories\Database,
};

class StudentsController extends AbstractModelController
{
  private StudentRepository $modelRepository;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    StudentRepository $modelRepository,
    RouterInterface $router,
    Database $database,
  )
  {
    parent::__construct($decorators, $loginService, $router, $database);
    $this->modelRepository = $modelRepository;
  }

  protected function getModelName(): string
  {
    return 'student';
  }

  protected function getModelNamePlural(): string
  {
    return 'students';
  }

  protected function getModelRepository(): StudentRepository
  {
    return $this->modelRepository;
  }

  protected function parseId(string $idString): int
  {
    return (int) $idString;
  }

  protected function createModel(array $data): AbstractFormData
  {
    return new StudentModel($data);
  }
}
