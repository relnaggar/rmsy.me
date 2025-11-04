<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\{
  Forms\Login as LoginForm,
  Services\Login as LoginService,
  Components\Alert,
};

class Login extends AbstractController
{
  private LoginService $loginService;

  public function __construct(
    array $decorators,
    LoginService $loginService,
  )
  {
    parent::__construct($decorators);
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
    $templateVars['alert'] = new Alert(
      type: 'danger',
      title: 'Login failure!',
      message: <<<HTML
        Login failed but it's not clear why.
        The login form could be under maintenance or broken.
        If the problem persists, please <a href="/contact">let me know</a>.
      HTML
    );

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $formData = new LoginForm($_POST[$templateVars['formName']]);
    $errors = $formData->validate();

    // display error alert if form data is invalid
    if (!empty($errors)) {
      // pass error code to template
      $templateVars['alert']->message = $errors[array_key_first($errors)];
      return $this->getPage($templatePath, $templateVars);
    }

    // check credentials
    try {
      if (!$this->loginService->login(
        $formData->email,
        $formData->password,
      )) {
        $templateVars['alert']->message = <<<HTML
          Login credentials not recognised. Please check your email and password
          and try again.
        HTML;
        return $this->getPage($templatePath, $templateVars);
      }
    } catch (PDOException $e) {
      $templateVars['alert']->message = <<<HTML
        There was a database error while attempting to log you in.
        The login form could be under maintenance or broken.
        If the problem persists, please <a href="/contact">let me know</a>.
      HTML;
      error_log($e->getMessage());
      return $this->getPage($templatePath, $templateVars);
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
