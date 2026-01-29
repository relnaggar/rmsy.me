<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use PDOException;
use Relnaggar\Veloz\{
  Routing\RouterInterface,
  Views\Page,
  Data\AbstractFormData,
};
use RmsyMe\{
  Attributes\RequiresAuth,
  Repositories\LessonRepository,
  Services\CalendarService,
  Repositories\Database,
  Services\LoginService,
  Models\LessonModel,
};

#[RequiresAuth]
class LessonsController extends AbstractModelController
{
  private LessonRepository $modelRepository;
  private CalendarService $calendarService;

  public function __construct(
    array $decorators,
    LoginService $loginService,
    RouterInterface $router,
    Database $database,
    LessonRepository $modelRepository,
    CalendarService $calendarService,
  )
  {
    parent::__construct($decorators, $loginService, $router, $database);
    $this->modelRepository = $modelRepository;
    $this->calendarService = $calendarService;
  }

  protected function getModelName(): string
  {
    return 'lesson';
  }

  protected function getModelNamePlural(): string
  {
    return 'lessons';
  }

  protected function getModelRepository(): LessonRepository
  {
    return $this->modelRepository;
  }

  protected function parseId(string $idString): int
  {
    return (int)$idString;
  }

  protected function createModel(array $data): AbstractFormData
  {
    return new LessonModel($data);
  }

  public function importFromCalendar(): Page
  {
    try {
      $this->calendarService->importLessonsFromCalendar();
    } catch (PDOException $e) {
      return $this->database->getDatabaseErrorPage($this, $e);
    }
    $this->redirect('/portal/lessons', 303);
    return Page::empty();
  }
}
