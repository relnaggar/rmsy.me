<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use PrinsFrank\Standards\{
  Country\CountryAlpha2,
  Language\LanguageAlpha2,
};
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
  Routing\RouterInterface,
};
use RmsyMe\{
  Services\LoginService,
  Attributes\RequiresAuth,
  Traits\AuthenticatesTrait,
  Repositories\BuyerRepository,
  Models\BuyerModel,
  Components\Alert,
  Repositories\Database,
};

#[RequiresAuth]
class BuyersController extends AbstractController
{
  use AuthenticatesTrait;

  private LoginService $loginService;
  private BuyerRepository $modelRepository;
  private RouterInterface $router;
  private Database $database;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    BuyerRepository $modelRepository,
    RouterInterface $router,
    Database $database,
  )
  {
    parent::__construct($decorators);
    $this->loginService = $loginService;
    $this->modelRepository = $modelRepository;
    $this->router = $router;
    $this->database = $database;
  }

  protected function getLoginService(): LoginService
  {
    return $this->loginService;
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

  private function getEditTemplateDetails(string $encodedId): array
  {
    return [
      'title' => 'Buyer Details',
      'encodedBuyerId' => $encodedId,
      'formName' => 'editForm',
      'countryOptions' => $this->getCountryOptions(),
    ];
  }


  public function edit(string $encodedId): Page
  {
    $templateVars = $this->getEditTemplateDetails($encodedId);

    // verify modelInstance exists
    try {
      $modelInstance = $this->modelRepository->selectOne(urldecode($encodedId));
      if ($modelInstance === null) {
        return $this->router->getPageNotFound()->getPage();
      }
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    // pre-fill form data
    $_POST[$templateVars['formName']] = (array) $modelInstance;

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars
    );
  }

  public function editSubmit(string $encodedId): Page
  {
    $templateVars = $this->getEditTemplateDetails($encodedId);
    $templatePath = 'edit';

    // verify modelInstance exists
    try {
      $modelInstance = $this->modelRepository->selectOne(urldecode($encodedId));
      if ($modelInstance === null) {
        return $this->router->getPageNotFound()->getPage();
      }
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    // display error alert by default
    $templateVars['alert'] = new Alert(
      type: 'danger',
      title: 'Update failed!',
      message: <<<HTML
        There was an error submitting the buyer form but it's not clear why.
      HTML
    );

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $formData = new BuyerModel($_POST[$templateVars['formName']]);
    $errors = $formData->validate();
    if (!empty($errors)) {
      $templateVars['alert']->message = $errors[array_key_first($errors)];
      return $this->getPage($templatePath, $templateVars);
    }

    // update modelInstance in database
    try {
      $this->modelRepository->update($formData);
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $templateVars['alert']->message = <<<HTML
        There was a database error while attempting to update the buyer.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // success
    $templateVars['alert'] = new Alert(
      type: 'success',
      title: 'Update successful!',
      message: <<<HTML
        <p>
          The buyer has been updated successfully!
        </p>
      HTML
    );

    return $this->getPage($templatePath, $templateVars);
  }

  public function index(): Page
  {
    try {
      $modelInstances = $this->modelRepository->selectAll();
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Buyers',
        'buyers' => $modelInstances,
      ]
    );
  }
}
