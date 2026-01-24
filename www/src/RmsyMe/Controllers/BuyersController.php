<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PrinsFrank\Standards\{
  Country\CountryAlpha2,
  Language\LanguageAlpha2,
};
use Relnaggar\Veloz\{
  Data\AbstractFormData,
  Routing\RouterInterface,
};
use RmsyMe\{
  Services\LoginService,
  Repositories\BuyerRepository,
  Models\BuyerModel,
  Repositories\Database,
};

class BuyersController extends AbstractModelController
{
  private BuyerRepository $modelRepository;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    BuyerRepository $modelRepository,
    RouterInterface $router,
    Database $database,
  )
  {
    parent::__construct($decorators, $loginService, $router, $database);
    $this->modelRepository = $modelRepository;
  }

  protected function getModelName(): string
  {
    return 'buyer';
  }

  protected function getModelNamePlural(): string
  {
    return 'buyers';
  }

  protected function getModelRepository(): BuyerRepository
  {
    return $this->modelRepository;
  }

  protected function parseId(string $idString): string
  {
    return urldecode($idString);
  }

  protected function createModel(array $data): AbstractFormData
  {
    return new BuyerModel($data);
  }

  private function getCountryOptions(): array
  {
    $countryOptions = [];
    foreach (CountryAlpha2::cases() as $country) {
      $countryOptions[$country->value] = $country->getNameInLanguage(
        LanguageAlpha2::English
      );
    }
    return $countryOptions;
  }

  protected function getEditTemplateVars(mixed $id): array
  {
    $templateVars = parent::getEditTemplateVars($id);
    $templateVars['countryOptions'] = $this->getCountryOptions();
    return $templateVars;
  }
}
