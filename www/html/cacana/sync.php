<?php

declare(strict_types=1);

require_once '/vendor/autoload.php'; // composer

use Relnaggar\Veloz\Config;
Config::getInstance()->set('sourceDirectory', __DIR__ . '/../../src/');

require_once '/vendor/relnaggar/veloz/autoload.php'; // for Cacana

use Cacana\Database;

header('Content-Type: application/json');

// Check authentication
session_start();
if (!isset($_SESSION['cacanaUsername'])) {
  http_response_code(401);
  echo json_encode(['error' => 'Unauthorized']);
  exit();
}
$username = $_SESSION['cacanaUsername'];

try {
  $database = new Database();
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error on connection']);
  exit();
}

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
$outbox = $request['outbox'];

if (
  !isset($request['latestTimestamp']) 
  || !is_numeric($request['latestTimestamp'])
) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid or missing latestTimestamp']);
  exit();
}
$latestTimestamp = (int)$request['latestTimestamp'];

foreach ($outbox as $outboxItem) {
  if (
    !isset($outboxItem['uuid'])
    || !isset($outboxItem['table'])
    || !in_array($outboxItem['table'], ['cacas', 'users'])
    || !isset($outboxItem['entityUuid'])
    || !isset($outboxItem['timestamp'])
    || !is_numeric($outboxItem['timestamp'])
    || !isset($outboxItem['action'])
    || !in_array($outboxItem['action'], ['create', 'delete', 'updateColour'])
  ) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid outbox item format']);
    exit();
  }
}

try {
  $database->processOutbox($username, $outbox);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error on processing outbox']);
  exit();
}

try {
  $cacas = $database->getCacasSince($username, $latestTimestamp);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error on fetching cacas']);
  exit();
}

try {
  $userColour = $database->getUserColourIfUpdated($username, $latestTimestamp);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error on fetching user colour']);
  exit();
}

try {
  $newLatestTimestamp = $database->getLatestUpdateTimestamp($username);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error on fetching latest timestamp']);
  exit();
}

http_response_code(200);
$responseData = [
  'success' => true,
  'cacas' => $cacas,
  'newLatestTimestamp' => $newLatestTimestamp
];
if ($userColour !== null) {
  $responseData['userColour'] = $userColour;
}
echo json_encode($responseData);
exit();
