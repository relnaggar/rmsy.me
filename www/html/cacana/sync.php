<?php

declare(strict_types=1);

require_once '/vendor/autoload.php'; // composer

use Relnaggar\Veloz\Config;
Config::getInstance()->set('sourceDirectory', __DIR__ . '/../../src/');

require_once '/vendor/relnaggar/veloz/autoload.php'; // for Cacana

use Cacana\Database;


try {
  $database = new Database();
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error on connection']);
  exit();
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit();
}

if (
  !isset($_SERVER['CONTENT_TYPE'])
  || strpos($_SERVER['CONTENT_TYPE'], 'application/json') === false
) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid content type']);
  exit();
}

$raw = file_get_contents('php://input');

if ($raw === false) {
  http_response_code(400);
  echo json_encode(['error' => 'Failed to read request body']);
  exit();
}

$request = json_decode($raw, true);

if ($request === null) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit();
}

if (!isset($request['outbox']) || !is_array($request['outbox'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid or missing outbox data']);
  exit();
}

foreach ($request['outbox'] as $outboxItem) {
  if (
    !isset($outboxItem['uuid'])
    || !isset($outboxItem['table'])
    || !in_array($outboxItem['table'], ['cacas'])
    || !isset($outboxItem['entityUuid'])
    || !isset($outboxItem['timestamp'])
    || !is_numeric($outboxItem['timestamp'])
    || !isset($outboxItem['action'])
    || !in_array($outboxItem['action'], ['create', 'delete'])
  ) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid outbox item format']);
    exit();
  }
}

try {
  $success = $database->processOutbox($request['outbox']);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error on processing outbox']);
  exit();
}

echo json_encode(['success' => $success]);
