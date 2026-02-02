<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Data\AbstractFormData,
  Views\Page,
  Routing\RouterInterface,
  Repositories\AbstractRepository,
};
use RmsyMe\{
  Services\LoginService,
  Attributes\RequiresAuth,
  Traits\AuthenticatesTrait,
  Components\Alert,
  Repositories\Database,
};

#[RequiresAuth]
abstract class AbstractModelController extends AbstractController
{
  use AuthenticatesTrait;

  private LoginService $loginService;
  protected RouterInterface $router;
  protected Database $database;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    RouterInterface $router,
    Database $database,
  )
  {
    parent::__construct($decorators);
    $this->loginService = $loginService;
    $this->router = $router;
    $this->database = $database;
  }

  protected function getLoginService(): LoginService
  {
    return $this->loginService;
  }

  /**
   * Get the singular model name (e.g., "buyer", "student", "client").
   * 
   * @return string The singular model name.
   */
  abstract protected function getModelName(): string;

  /**
   * Get the plural model name (e.g., "buyers", "students", "clients").
   * 
   * @return string The plural model name.
   */
  abstract protected function getModelNamePlural(): string;

  /**
   * Get the model repository.
   * 
   * @return AbstractRepository The model repository.
   */
  abstract protected function getModelRepository(): AbstractRepository;

  /**
   * Parse the ID from the URL string parameter.
   * 
   * @param string $idString The ID string from the URL.
   * @return mixed The parsed ID.
   */
  abstract protected function parseId(string $idString): mixed;

  /**
   * Create a model instance from form data.
   * 
   * @param array $data The form data.
   * @return AbstractFormData The created model instance.
   */
  abstract protected function createModel(array $data): AbstractFormData;

  /**
   * Get template variables for the edit page.
   * Override in subclass to add extra variables.
   * 
   * @param mixed $id The model ID.
   * @return array The template variables.
   */
  protected function getEditTemplateVars(mixed $id): array
  {
    return [
      'title' => ucfirst($this->getModelName()) . ' Details',
      $this->getModelName() . 'Id' => $id,
      'formName' => $this->getModelName() . 'editForm',
    ];
  }

  public function edit(string $idString): Page
  {
    $id = $this->parseId($idString);
    $templateVars = $this->getEditTemplateVars($id);

    // verify modelInstance exists
    try {
      $modelInstance = $this->getModelRepository()->selectOne($id);
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

  public function editSubmit(string $idString): Page
  {
    $id = $this->parseId($idString);
    $templateVars = $this->getEditTemplateVars($id);
    $templatePath = 'edit';
    $modelName = $this->getModelName();

    // verify modelInstance exists
    try {
      $modelInstance = $this->getModelRepository()->selectOne($id);
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
        There was an error submitting the edit $modelName form but it's not
        clear why.
      HTML
    );

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $formData = $_POST[$templateVars['formName']];
    $formData['id'] = $id;
    $model = $this->createModel($formData);
    $errors = $model->validate();
    if (!empty($errors)) {
      $templateVars['alert']->message = $errors[array_key_first($errors)];
      return $this->getPage($templatePath, $templateVars);
    }

    // update modelInstance in database
    try {
      $this->getModelRepository()->update($model);
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $templateVars['alert']->message = <<<HTML
        There was a database error while attempting to update the $modelName.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // success
    $templateVars['alert'] = new Alert(
      type: 'success',
      title: 'Update successful!',
      message: <<<HTML
        <p>
          The $modelName has been updated successfully!
        </p>
      HTML
    );

    return $this->getPage($templatePath, $templateVars);
  }

  protected function getIndexTemplateVars(): array
  {
    return [
      'title' => ucfirst($this->getModelNamePlural()),
    ];
  }

  public function index(): Page
  {
    try {
      $modelInstances = $this->getModelRepository()->selectAll();
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    $templateVars = $this->getIndexTemplateVars();
    $templateVars[$this->getModelNamePlural()] = $modelInstances;

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars,
    );
  }

  public function clear(): Page
  {
    try {
      $this->getModelRepository()->deleteAll();
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }
    $this->redirect("/portal/{$this->getModelNamePlural()}", 303);
    return Page::empty();
  }
}
