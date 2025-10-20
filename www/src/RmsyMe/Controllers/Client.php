<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\{
  Services\Database,
  Data\LoginFormData,
};

class Client extends AbstractController
{
  private Database $databaseService;

  public function __construct(array $decorators, Database $databaseService)
  {
    parent::__construct($decorators);
    $this->databaseService = $databaseService;
  }

  private function getLoginTemplateVars(): array
  {
    return [
      'title' => 'Client Login',
      'metaDescription' => 'Client login page.',
      'metaRobots' => 'noindex, nofollow',
      'formName' => 'loginForm',
    ];
  }

  public function login(): Page
  {
    return $this->getPage(
      bodyTemplatePath: __FUNCTION__,
      templateVars: $this->getLoginTemplateVars(),
    );
  }

  public function loginSubmit(): Page
  {
    $templatePath = 'login';
    $templateVars = $this->getLoginTemplateVars();

    // display error alert by default
    $templateVars['displayAlert'] = true;

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $loginFormData = new LoginFormData($_POST[$templateVars['formName']]);
    $errorCodes = $loginFormData->validate();

    // display error alert if form data is invalid
    if (!empty($errorCodes)) {
      // pass error code to template
      $templateVars['errorCode'] = array_keys($errorCodes)[0];
      return $this->getPage($templatePath, $templateVars);
    }

    // check credentials
    try {
      if (!$this->databaseService->login(
        $loginFormData->email,
        $loginFormData->password,
      )) {
        $templateVars['errorCode'] = 'login';
        return $this->getPage($templatePath, $templateVars);
      }
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $this->redirect('/database-error', 302);
      return Page::empty();
    }

    // success - redirect to dashboard
    $this->redirect('/', 302);
    return Page::empty();
  }
}
