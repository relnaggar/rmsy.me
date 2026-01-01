<?php

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

foreach ($request['outbox'] as $outboxItem) {
  // TODO process each valid outbox item
}

echo json_encode(['success' => true]);
