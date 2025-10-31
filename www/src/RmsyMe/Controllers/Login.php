<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\{
  Data\LoginFormData,
  Services\Login as LoginService,
  Services\Database,
};

class Login extends AbstractController
{
  private LoginService $loginService;
  private Database $databaseService;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    Database $databaseService,
  )
  {
    parent::__construct($decorators);
    $this->loginService = $loginService;
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

  private function redirectToClientDashboard(): Page
  {
    $this->redirect('/client/', 302);
    return Page::empty();
  }

  public function login(): Page
  {
    $userId = $this->loginService->getLoggedInUserId();
    if ($userId !== null) {
      return $this->redirectToClientDashboard();
    }

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
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
      if (!$this->loginService->login(
        $loginFormData->email,
        $loginFormData->password,
      )) {
        $templateVars['errorCode'] = 'login';
        return $this->getPage($templatePath, $templateVars);
      }
    } catch (PDOException $e) {
      return $this->databaseService->getDatabaseErrorPage($this, $e);
    }

    // success
    return $this->redirectToClientDashboard();
  }

  public function logout(): Page
  {
    $this->loginService->logout();
    $this->redirect('/client/login', 302);
    return Page::empty();
  }
}
