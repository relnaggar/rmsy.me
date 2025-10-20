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
  Services\Database,
  Services\Login,
};

class Client extends AbstractController
{
  private Database $databaseService;
  private Login $loginService;

  public function __construct(
    array $decorators,
    Database $databaseService,
    Login $loginService
  )
  {
    parent::__construct($decorators);
    $this->databaseService = $databaseService;
    $this->loginService = $loginService;
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
    $userId = $this->loginService->getLoggedInUserId();
    if ($userId !== -1) {
      $this->redirect('/welcome', 302);
      return Page::empty();
    }

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
      if (!$this->loginService->login(
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
    $this->redirect('/welcome', 302);
    return Page::empty();
  }

  private function authenticate(): int
  {
    $userId = $this->loginService->getLoggedInUserId();
    if ($userId === -1) {
      $this->redirect('/login', 302);
      return 0;
    } else {
      return $userId;
    }
  }

  public function logout(): Page
  {
    $this->loginService->logout();
    $this->redirect('/login', 302);
    return Page::empty();
  }

  public function welcome(): Page
  {
    $loggedInUserId = $this->authenticate();

    return $this->getPage(
      bodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Welcome',
        'userEmail' => $this->databaseService->getUserEmail($loggedInUserId),
      ],
    );
  }
}
