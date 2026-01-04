<?php

declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit();
}

session_start();
unset($_SESSION['cacanaUsername']);

http_response_code(200);
echo json_encode(['success' => true]);
exit();
