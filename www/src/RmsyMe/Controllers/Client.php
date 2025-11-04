<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use finfo;
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
  Services\Database,
  Services\Login,
  Components\Alert,
  Models\Payer,
};

class Client extends AbstractController
{
  private Login $loginService;
  private Database $databaseService;
  private RouterInterface $router;
  
  public function __construct(
    array $decorators,
    Login $loginService,
    Database $databaseService,
    RouterInterface $router,
  )
  {
    parent::__construct($decorators);
    $this->loginService = $loginService;
    $this->databaseService = $databaseService;
    $this->router = $router;
  }

  private function authenticate(): int
  {
    $userId = $this->loginService->getLoggedInUserId();
    if ($userId === null) {
      $this->redirect('/client/login', 302);
      return 0;
    } else {
      return $userId;
    }
  }

  public function index(): Page
  {
    $loggedInUserId = $this->authenticate();
    try {
      $userEmail = $this->databaseService->getUserEmail($loggedInUserId);
    } catch (PDOException $e) {
      return $this->databaseService->getDatabaseErrorPage($this, $e);
    }
    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Dashboard',
        'userEmail' => $userEmail,
      ]
    );
  }

  private function getPayments(array &$templateVars): void
  {
    try {
      $templateVars['payments'] = $this->databaseService->getPayments();
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $templateVars['alert'] = new Alert(
        type: 'danger',
        title: 'Error loading payments!',
        message: <<<HTML
          There was a database error while attempting to load the payments.
        HTML,
      );
    }
  }

  private function getPaymentsTemplateVars(): array
  {
    $templateVars = [
      'title' => 'Payments',
      'formName' => 'paymentsForm',
    ];
    $this->getPayments($templateVars);
    return $templateVars;
  }

  public function payments(): Page
  {
    $this->authenticate();
    $templateVars = $this->getPaymentsTemplateVars();

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars,
    );
  }

  public function paymentsSubmit(): Page
  {
    $this->authenticate();
    $templatePath = 'payments';
    $templateVars = $this->getPaymentsTemplateVars();

    $formName = $templateVars['formName'];
    $fieldName = 'csvFile';

    // display error alert by default
    $templateVars['alert'] = new Alert(
      type: 'danger',
      title: 'Upload failed!',
      message: <<<HTML
        There was an error uploading the payments but it's not clear why.
      HTML,
    );

    // Check if file was uploaded
    if (!isset($_FILES[$formName]) || !isset($_FILES[$formName]['error'][$fieldName])) {
      $templateVars['alert']->message = <<<HTML
        No file uploaded.
        Please try again.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // Check for upload errors
    if ($_FILES[$formName]['error'][$fieldName] !== UPLOAD_ERR_OK) {
      $templateVars['alert']->message = <<<HTML
        File upload error.
        Please try again.
      HTML;
      error_log('File upload error code: ' . $_FILES[$formName]['error'][$fieldName]);
      return $this->getPage($templatePath, $templateVars);
    }

    // Validate file type (only allow CSV files)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($_FILES[$formName]['tmp_name'][$fieldName]);
    if (!in_array($mime, ['text/plain', 'text/csv'], true)) {
      $templateVars['alert']->message = <<<HTML
        Invalid file type.
        Please upload a valid CSV file.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // Import payments from CSV
    try {
      if (!$this->databaseService->importPayments($_FILES[$formName]['tmp_name'][$fieldName])) {
        $templateVars['alert']->message = <<<HTML
          Failed to import payments from the CSV file.
          Please ensure the file is correctly formatted.
        HTML;
        return $this->getPage($templatePath, $templateVars);
      }
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $templateVars['alert']->message = <<<HTML
          There was a database error while attempting to import the payments.
        HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // Refresh payments list
    $this->getPayments($templateVars);

    // Success
    $templateVars['alert'] = new Alert(
      type: 'success',
      title: 'Upload successful!',
      message: <<<HTML
        <p>
          The payments have been imported successfully!
        </p>
      HTML
    );
    return $this->getPage($templatePath, $templateVars);
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

  private function getPayerTemplateVars(string $encodedPayerId): array
  {
    return [
      'title' => 'Payer Details',
      'encodedPayerId' => $encodedPayerId,
      'formName' => 'payerForm',
      'countryOptions' => $this->getCountryOptions(),
    ];
  }

  public function payer(string $encodedPayerId): Page
  {
    $this->authenticate();
    $templateVars = $this->getPayerTemplateVars($encodedPayerId);

    try {
      $payer = $this->databaseService->getPayer(urldecode($encodedPayerId));
      if ($payer === null) {
        return $this->router->getPageNotFound()->getPage();
      }
    } catch (PDOException $e) {
      return $this->databaseService->getDatabaseErrorPage($this, $e);
    }

    // pre-fill form data
    $_POST[$templateVars['formName']] = (array) $payer;

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars
    );
  }

  public function payerSubmit(string $encodedPayerId): Page
  {
    $this->authenticate();
    $templateVars = $this->getPayerTemplateVars($encodedPayerId);
    $templatePath = 'payer';

    try {
      $payer = $this->databaseService->getPayer(urldecode($encodedPayerId));
      if ($payer === null) {
        return $this->router->getPageNotFound()->getPage();
      }
    } catch (PDOException $e) {
      return $this->databaseService->getDatabaseErrorPage($this, $e);
    }

    // display error alert by default
    $templateVars['alert'] = new Alert(
      type: 'danger',
      title: 'Update failed!',
      message: <<<HTML
        There was an error submitting the payer form but it's not clear why.
      HTML
    );

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $formData = new Payer($_POST[$templateVars['formName']]);
    $errors = $formData->validate();
    if (!empty($errors)) {
      $templateVars['alert']->message = $errors[array_key_first($errors)];
      return $this->getPage($templatePath, $templateVars);
    }

    // update payer in database
    try {
      $this->databaseService->updatePayer($formData);
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $templateVars['alert']->message = <<<HTML
        There was a database error while attempting to update the payer.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // success
    $templateVars['alert'] = new Alert(
      type: 'success',
      title: 'Update successful!',
      message: <<<HTML
        <p>
          The payer has been updated successfully!
        </p>
      HTML
    );

    return $this->getPage($templatePath, $templateVars);
  }
}
