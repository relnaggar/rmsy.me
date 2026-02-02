<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use DateTime;
use PDO;
use RmsyMe\{
  Controllers\MicrosoftAuthController,
  Repositories\Database,
  Repositories\ClientRepository,
  Repositories\StudentRepository,
};

class CalendarService
{
  private PDO $pdo;
  private MicrosoftAuthController $microsoftAuthController;
  private ClientRepository $clientRepository;
  private StudentRepository $studentRepository;

  public function __construct(
    Database $database,
    MicrosoftAuthController $microsoftAuthController,
    ClientRepository $clientRepository,
    StudentRepository $studentRepository,
  ) {
    $this->pdo = $database->getConnection();
    $this->microsoftAuthController = $microsoftAuthController;
    $this->clientRepository = $clientRepository;
    $this->studentRepository = $studentRepository;
  }

  public function importLessonsFromCalendar(): void
  {
    $insertLessonStmt = $this->pdo->prepare(<<<SQL
      INSERT OR IGNORE INTO lessons (
        datetime,
        duration_minutes,
        repeat_weeks,
        price_gbp_pence,
        student_id,
        client_id,
        buyer_id
      )
      VALUES (
        :datetime,
        :duration_minutes,
        :repeat_weeks,
        :price_gbp_pence,
        :student_id,
        :client_id,
        :buyer_id
      )
    SQL);

    $events = $this->microsoftAuthController->getCalendarEvents();
    foreach ($events as $event) {
      // parse event data
      $subject = $event['subject'];
      if (!str_contains($subject, '£')) {
        if (!str_contains($subject, 'meeting')) {
          var_dump("Skipping free event: $subject<br>");
        }
        continue;
      }

      // extract source
      $parts = explode(':', $subject);
      if (count($parts) < 2) {
        var_dump("Skipping event with invalid subject: $subject<br>");
        continue;
      }
      $firstPart = trim($parts[0]);
      $firstSubparts = explode(' ', $firstPart);
      if (count($firstSubparts) < 2) {
        var_dump("Skipping event with invalid subject: $subject<br>");
        continue;
      }
      $source = trim($firstSubparts[0]);

      // extract price
      preg_match('/£([0-9]+(\.[0-9]{1,2})?)/', $subject, $matches);
      if (count($matches) === 0) {
        var_dump("Skipping event with invalid price: $subject<br>");
        continue;
      }
      $price_gbp_pence = (int)round(floatval($matches[1]) * 100);

      // determine student/client
      $secondPart = trim($parts[1]);
      $secondSubparts = explode(',', $secondPart);
      $studentClient = trim($secondSubparts[0]);
      $studentClientParts = explode('/', $studentClient);
      $isMatch = function($record, $dbRecord) {
        if (is_object($dbRecord)) {
          return str_starts_with($dbRecord->name, $record['name']);
        } else {
          return str_starts_with($dbRecord['name'], $record['name']);
        }
      };
      if (count($studentClientParts) < 2) {
        $studentName = trim($studentClientParts[0]);
        $client_id = $this->clientRepository->getPkOrCreate(
          ['name' => $studentName],
          $isMatch,
        );
        $student_id = $this->studentRepository->getPkOrCreate(
          ['name' => $studentName],
          $isMatch,
        );
      } else if (count($studentClientParts) === 2) {
        $studentFirstName = trim($studentClientParts[0]);
        $clientFirstName = trim($studentClientParts[1]);
        $client_id = $this->clientRepository->getPkOrCreate(
          ['name' => $clientFirstName],
          $isMatch,
        );
        $student_id = $this->studentRepository->getPkOrCreate(
          ['name' => $studentFirstName],
          $isMatch,
        );
      } else {
        var_dump("Skipping event with invalid student/client: $subject<br>");
        continue;
      }

      // determine buyer
      switch ($source) {
        case 'MyTutor':
          $buyer_id = 'MYTUTORWEB LIMITED';
          break;
        case 'Tutorful':
          $buyer_id = 'TUTORA LTD';
          break;
        case 'Spires':
          $buyer_id = 'SOTC LTD';
          break;
        case 'TutorRecruiter':
          $buyer_id = 'TUTORCRUNCHER LTD';
          break;
        case 'Superprof':
          $buyer_id = 'PAYPAL';
          break;
        case 'private':
          $buyer_id = 'PRIVATE';
          break;
        default:
          var_dump("Skipping event with unknown source: $subject<br>");
          continue 2;
      }

      // extract start time
      $startDateTime = $event['start']['dateTime'];

      // calculate duration in minutes
      $start_dt = new DateTime($startDateTime);
      $end_dt = new DateTime($event['end']['dateTime']);
      $duration_minutes = (int)round(
        ($end_dt->getTimestamp() - $start_dt->getTimestamp()) / 60
      );
      if ($duration_minutes === 60) {
        $duration_minutes = 55; // standardise to 55 minutes
      }

      // determine if this is part of a recurring series
      if (strtolower($event['type']) === 'occurrence') {
        $repeat_weeks = 1;
      } else {
        $repeat_weeks = 0;
      }

      // insert lesson into database
      $insertLessonStmt->execute(
        [
          'datetime' => $startDateTime,
          'duration_minutes' => $duration_minutes,
          'repeat_weeks' => $repeat_weeks,
          'price_gbp_pence' => $price_gbp_pence,
          'student_id' => $student_id,
          'client_id' => $client_id,
          'buyer_id' => $buyer_id,
        ]
      );
    }
  }

  public function isAuthorised(): bool
  {
    return $this->microsoftAuthController->isAuthorised();
  }
}