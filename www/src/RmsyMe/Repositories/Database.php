<?php

declare(strict_types=1);

namespace RmsyMe\Repositories;

use PDO;
use PDOException;
use Relnaggar\Veloz\{
  Views\Page,
  Controllers\AbstractController,
  Repositories\DatabaseInterface,
};

class Database implements DatabaseInterface
{
  private ?PDO $pdo;

  public function __construct()
  {
    $this->pdo = null;
  }

  public function getConnection(): PDO
  {
    if ($this->pdo === null) {
      $this->pdo = new PDO('sqlite:/var/db/rmsy.me.sqlite3');
    }
    return $this->pdo;
  }

  public function getDatabaseErrorPage(
    AbstractController $controller,
    PDOException $e,
  ): Page {
    http_response_code(500);
    error_log($e->getMessage());
    return $controller->getPage(
      fullBodyTemplatePath: 'Site/databaseError',
      templateVars: [
        'title' => 'Database Error',
        'metaRobots' => 'noindex, nofollow'
      ],
    );
  }
}
