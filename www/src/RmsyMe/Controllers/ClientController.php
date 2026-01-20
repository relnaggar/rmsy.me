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
  Services\LoginService,
  Services\InvoiceService,
  Services\CalendarService,
  Components\Alert,
  Models\BuyerModel,
  Models\StudentModel,
  Models\ClientModel,
  Repositories\Database,
  Repositories\UserRepository,
  Repositories\PaymentRepository,
  Repositories\BuyerRepository,
  Repositories\ClientRepository,
  Repositories\StudentRepository,
  Repositories\LessonRepository,
};

class ClientController extends AbstractController
{
  private LoginService $loginService;
  private InvoiceService $invoiceService;
  private CalendarService $calendarService;
  private RouterInterface $router;
  private Database $database;
  private UserRepository $userRepository;
  private PaymentRepository $paymentRepository;
  private BuyerRepository $buyerRepository;
  private ClientRepository $clientRepository;
  private StudentRepository $studentRepository;
  private LessonRepository $lessonRepository;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    InvoiceService $invoiceService,
    CalendarService $calendarService,
    RouterInterface $router,
    Database $database,
    UserRepository $userRepository,
    PaymentRepository $paymentRepository,
    BuyerRepository $buyerRepository,
    ClientRepository $clientRepository,
    StudentRepository $studentRepository,
    LessonRepository $lessonRepository,
  )
  {
    parent::__construct($decorators);
    $this->loginService = $loginService;
    $this->database = $database;
    $this->invoiceService = $invoiceService;
    $this->calendarService = $calendarService;
    $this->router = $router;
    $this->userRepository = $userRepository;
    $this->paymentRepository = $paymentRepository;
    $this->buyerRepository = $buyerRepository;
    $this->clientRepository = $clientRepository;
    $this->studentRepository = $studentRepository;
    $this->lessonRepository = $lessonRepository;
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
      $userEmail = $this->userRepository->selectEmail($loggedInUserId);
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
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

  private function getBuyerTemplateVars(string $encodedBuyerId): array
  {
    return [
      'title' => 'Buyer Details',
      'encodedBuyerId' => $encodedBuyerId,
      'formName' => 'buyerForm',
      'countryOptions' => $this->getCountryOptions(),
    ];
  }

  public function buyer(string $encodedBuyerId): Page
  {
    $this->authenticate();
    $templateVars = $this->getBuyerTemplateVars($encodedBuyerId);

    // verify buyer exists
    try {
      $buyer = $this->buyerRepository->selectOne(urldecode($encodedBuyerId));
      if ($buyer === null) {
        return $this->router->getPageNotFound()->getPage();
      }
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    // pre-fill form data
    $_POST[$templateVars['formName']] = (array) $buyer;

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: $templateVars
    );
  }

  public function buyerSubmit(string $encodedBuyerId): Page
  {
    $this->authenticate();
    $templateVars = $this->getBuyerTemplateVars($encodedBuyerId);
    $templatePath = 'buyer';

    // verify buyer exists
    try {
      $buyer = $this->buyerRepository->selectOne(urldecode($encodedBuyerId));
      if ($buyer === null) {
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

    // update buyer in database
    try {
      $this->buyerRepository->update($formData);
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

  public function invoice(string $invoiceNumber): Page
  {
    $this->authenticate();

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
    $this->authenticate();

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

  public function buyers(): Page
  {
    $this->authenticate();

    try {
      $buyers = $this->buyerRepository->selectAll();
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }

    return $this->getPage(
      relativeBodyTemplatePath: __FUNCTION__,
      templateVars: [
        'title' => 'Buyers',
        'buyers' => $buyers,
      ]
    );
  }

  public function clients(): Page
  {
    $this->authenticate();

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
    $this->authenticate();

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
    $this->authenticate();
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
    $this->authenticate();
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
    $this->authenticate();
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
    $this->authenticate();
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
