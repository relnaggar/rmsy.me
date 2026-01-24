<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Relnaggar\Veloz\{
  Data\AbstractFormData,
  Routing\RouterInterface,
};
use RmsyMe\{
  Services\LoginService,
  Repositories\ClientRepository,
  Models\ClientModel,
  Repositories\Database,
};

class ClientsController extends AbstractModelController
{
  private ClientRepository $modelRepository;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    ClientRepository $modelRepository,
    RouterInterface $router,
    Database $database,
  )
  {
    parent::__construct($decorators, $loginService, $router, $database);
    $this->modelRepository = $modelRepository;
  }

  protected function getModelName(): string
  {
    return 'client';
  }

  protected function getModelNamePlural(): string
  {
    return 'clients';
  }

  protected function getModelRepository(): ClientRepository
  {
    return $this->modelRepository;
  }

  protected function parseId(string $idString): int
  {
    return (int) $idString;
  }

  protected function createModel(array $data): AbstractFormData
  {
    return new ClientModel($data);
  }
}
