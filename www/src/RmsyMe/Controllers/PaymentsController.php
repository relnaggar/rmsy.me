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
  Services\InvoiceService,
  Services\CalendarService,
  Components\Alert,
  Models\StudentModel,
  Models\ClientModel,
  Repositories\Database,
  Repositories\PaymentRepository,
  Repositories\ClientRepository,
  Repositories\StudentRepository,
  Repositories\LessonRepository,
  Attributes\RequiresAuth,
  Services\LoginService,
  Traits\AuthenticatesTrait,
};

#[RequiresAuth]
class PaymentsController extends AbstractController
{
  use AuthenticatesTrait;

  private LoginService $loginService;
  private InvoiceService $invoiceService;
  private CalendarService $calendarService;
  private RouterInterface $router;
  private Database $database;
  private PaymentRepository $paymentRepository;
  private ClientRepository $clientRepository;
  private StudentRepository $studentRepository;
  private LessonRepository $lessonRepository;

  public function __construct(
    array $decorators,
    InvoiceService $invoiceService,
    CalendarService $calendarService,
    RouterInterface $router,
    Database $database,
    PaymentRepository $paymentRepository,
    ClientRepository $clientRepository,
    StudentRepository $studentRepository,
    LessonRepository $lessonRepository,
    LoginService $loginService,
  )
  {
    parent::__construct($decorators);
    $this->loginService = $loginService;
    $this->database = $database;
    $this->invoiceService = $invoiceService;
    $this->calendarService = $calendarService;
    $this->router = $router;
    $this->paymentRepository = $paymentRepository;
    $this->clientRepository = $clientRepository;
    $this->studentRepository = $studentRepository;
    $this->lessonRepository = $lessonRepository;
  }

  protected function getLoginService(): LoginService
  {
    return $this->loginService;
  }

  private function getPayments(array &$templateVars): void
  {
    try {
      $templateVars['payments'] = $this->paymentRepository->selectAll();
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
    $templateVars = $this->getPaymentsTemplateVars();

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars,
    );
  }

  public function paymentsSubmit(): Page
  {
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

    // check for upload errors
    if ($_FILES[$formName]['error'][$fieldName] !== UPLOAD_ERR_OK) {
      $templateVars['alert']->message = <<<HTML
        File upload error.
        Please try again.
      HTML;
      error_log('File upload error code: ' . $_FILES[$formName]['error'][$fieldName]);
      return $this->getPage($templatePath, $templateVars);
    }

    // validate file type (only allow CSV files)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($_FILES[$formName]['tmp_name'][$fieldName]);
    if (!in_array($mime, ['text/plain', 'text/csv'], true)) {
      $templateVars['alert']->message = <<<HTML
        Invalid file type.
        Please upload a valid CSV file.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // import payments from CSV
    try {
      if (!$this->paymentRepository->importFromCsv(
        $_FILES[$formName]['tmp_name'][$fieldName]
      )) {
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

    // refresh payments list
    $this->getPayments($templateVars);

    // success
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

  public function invoice(string $invoiceNumber): Page
  {
    // verify invoice exists
    try {
      if (!$this->invoiceService->doesInvoiceExist($invoiceNumber)) {
        return $this->router->getPageNotFound()->getPage();
      }
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    // generate PDF download
    header('Content-Type: application/pdf');
    header(
      'Content-Disposition: inline; '
      . "filename=\"$invoiceNumber.pdf\""
    );
    echo $this->invoiceService->generateInvoicePdf($invoiceNumber);
    exit;

    return Page::empty();
  }

  public function lessons(): Page
  {
    $this->calendarService->importLessonsFromCalendar();
    $lessons = $this->lessonRepository->selectAll();

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Lessons',
        'lessons' => $lessons,
      ]
    );
  }

  public function clients(): Page
  {
    try {
      $clients = $this->clientRepository->selectAll();
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Clients',
        'clients' => $clients,
      ]
    );
  }

  public function students(): Page
  {
    try {
      $students = $this->studentRepository->selectAll();
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Students',
        'students' => $students,
      ]
    );
  }

  private function getStudentTemplateVars(int $studentId): array
  {
    return [
      'title' => 'Student Details',
      'studentId' => $studentId,
      'formName' => 'studentForm',
    ];
  }

  public function student(string $studentIdString): Page
  {
    $studentId = (int) $studentIdString;
    $templateVars = $this->getStudentTemplateVars($studentId);

    // verify student exists
    try {
      $student = $this->studentRepository->selectOne($studentId);
      if ($student === null) {
        return $this->router->getPageNotFound()->getPage();
      }
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    // pre-fill form data
    $_POST[$templateVars['formName']] = (array) $student;

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars
    );
  }

  public function studentSubmit(string $studentIdString): Page
  {
    $studentId = (int) $studentIdString;
    $templateVars = $this->getStudentTemplateVars($studentId);
    $templatePath = 'student';

    // verify student exists
    try {
      $student = $this->studentRepository->selectOne($studentId);
      if ($student === null) {
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
        There was an error submitting the student form but it's not clear why.
      HTML
    );

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $_POST[$templateVars['formName']]['id'] = $studentId;
    $formData = new StudentModel($_POST[$templateVars['formName']]);
    $errors = $formData->validate();
    if (!empty($errors)) {
      $templateVars['alert']->message = $errors[array_key_first($errors)];
      return $this->getPage($templatePath, $templateVars);
    }

    // update student in database
    try {
      $this->studentRepository->update($formData);
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $templateVars['alert']->message = <<<HTML
        There was a database error while attempting to update the student.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // success
    $templateVars['alert'] = new Alert(
      type: 'success',
      title: 'Update successful!',
      message: <<<HTML
        <p>
          The student has been updated successfully!
        </p>
      HTML
    );

    return $this->getPage($templatePath, $templateVars);
  }

  private function getClientTemplateVars(int $clientId): array
  {
    return [
      'title' => 'Client Details',
      'clientId' => $clientId,
      'formName' => 'clientForm',
    ];
  }

  public function client(string $clientIdString): Page
  {
    $clientId = (int) $clientIdString;
    $templateVars = $this->getClientTemplateVars($clientId);
    // verify client exists
    try {
      $client = $this->clientRepository->selectOne($clientId);
      if ($client === null) {
        return $this->router->getPageNotFound()->getPage();
      }
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    // pre-fill form data
    $_POST[$templateVars['formName']] = (array) $client;

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars
    );
  }

  public function clientSubmit(string $clientIdString): Page
  {
    $clientId = (int) $clientIdString;
    $templateVars = $this->getClientTemplateVars($clientId);
    $templatePath = 'client';

    // verify client exists
    try {
      $client = $this->clientRepository->selectOne($clientId);
      if ($client === null) {
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
        There was an error submitting the client form but it's not clear why.
      HTML
    );

    // display error alert if form not submitted
    if (!isset($_POST['submit']) || !isset($_POST[$templateVars['formName']])) {
      return $this->getPage($templatePath, $templateVars);
    }

    // validate form data
    $_POST[$templateVars['formName']]['id'] = $clientId;
    $formData = new ClientModel($_POST[$templateVars['formName']]);
    $errors = $formData->validate();
    if (!empty($errors)) {
      $templateVars['alert']->message = $errors[array_key_first($errors)];
      return $this->getPage($templatePath, $templateVars);
    }

    // update client in database
    try {
      $this->clientRepository->update($formData);
    } catch (PDOException $e) {
      error_log($e->getMessage());
      $templateVars['alert']->message = <<<HTML
        There was a database error while attempting to update the client.
      HTML;
      return $this->getPage($templatePath, $templateVars);
    }

    // success
    $templateVars['alert'] = new Alert(
      type: 'success',
      title: 'Update successful!',
      message: <<<HTML
        <p>
          The client has been updated successfully!
        </p>
      HTML
    );

    return $this->getPage($templatePath, $templateVars);
  }
}
