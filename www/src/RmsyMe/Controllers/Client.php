<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use finfo;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
  Routing\RouterInterface,
};
use RmsyMe\{
  Services\Database,
  Services\Login,
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

  private function getPaymentsTemplateVars(): array
  {
    return [
      'title' => 'Payments',
      'formName' => 'paymentsForm',
      'displayAlert' => false,
    ];
  }

  public function payments(): Page
  {
    $this->authenticate();
    $templateVars = $this->getPaymentsTemplateVars();
    try {
      $templateVars['payments'] = $this->databaseService->getPayments();
    } catch (PDOException $e) {
      return $this->databaseService->getDatabaseErrorPage($this, $e);
    }

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
    try {
      $templateVars['payments'] = $this->databaseService->getPayments();
    } catch (PDOException $e) {
      return $this->databaseService->getDatabaseErrorPage($this, $e);
    }

    // display alert by default
    $templateVars['displayAlert'] = true;
    $templateVars['success'] = false;    

    // Check if file was uploaded
    if (!isset($_FILES[$formName]) || !isset($_FILES[$formName]['error'][$fieldName])) {
      $templateVars['errorCode'] = 'upload';
      // error_log('No file uploaded.');
      return $this->getPage($templatePath, $templateVars);
    }

    // Check for upload errors
    if ($_FILES[$formName]['error'][$fieldName] !== UPLOAD_ERR_OK) {
      $templateVars['errorCode'] = 'upload';
      // error_log('File upload error code: ' . $_FILES[$formName]['error'][$fieldName]);
      return $this->getPage($templatePath, $templateVars);
    }

    // Validate file type (only allow CSV files)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($_FILES[$formName]['tmp_name'][$fieldName]);
    if (!in_array($mime, ['text/plain', 'text/csv'], true)) {
      $templateVars['errorCode'] = 'invalid_file_type';
      // error_log('Invalid file type. Only CSV files are allowed.');
      return $this->getPage($templatePath, $templateVars);
    }

    // // Ensure upload directory exists
    // $uploadDir = __DIR__ . '/../../../uploads/';
    // if (!is_dir($uploadDir) && !mkdir($uploadDir) && !is_dir($uploadDir)) {
    //   $templateVars['errorCode'] = 'upload';
    //   // error_log('Failed to create upload directory.');
    //   return $this->getPage($templatePath, $templateVars);
    // }

    // // Move from temp directory to permanent location
    // $destination = $uploadDir . basename($_FILES[$formName]['name'][$fieldName]);
    // if (!move_uploaded_file($_FILES[$formName]['tmp_name'][$fieldName], $destination)) {
    //   $templateVars['errorCode'] = 'upload';
    //   // error_log('Failed to move uploaded file.');
    //   return $this->getPage($templatePath, $templateVars);
    // }

    // Import payments from CSV
    try {
      if (!$this->databaseService->importPayments($_FILES[$formName]['tmp_name'][$fieldName])) {
        $templateVars['errorCode'] = 'import';
        return $this->getPage($templatePath, $templateVars);
      }
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $templateVars['errorCode'] = 'database';
      return $this->getPage($templatePath, $templateVars);
    }

    // Success
    $templateVars['success'] = true;
    // Refresh payments list
    try {
      $templateVars['payments'] = $this->databaseService->getPayments();
    } catch (PDOException $e) {
      return $this->databaseService->getDatabaseErrorPage($this, $e);
    }
    return $this->getPage($templatePath, $templateVars);
  }

  public function payer(string $payerId): Page
  {
    $this->authenticate();

    try {
      $payer = $this->databaseService->getPayer(urldecode($payerId));
    } catch (PDOException $e) {
      return $this->databaseService->getDatabaseErrorPage($this, $e);
    }

    if ($payer === null) {
      return $this->router->getPageNotFound()->getPage();
    }

    $formName = 'payerForm';
    $_POST[$formName] = (array) $payer;

    $templateVars = [
      'title' => 'Payer Details',
      'formName' => $formName,
      'payer' => $payer,
    ];
    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars,
    );
  }
}
