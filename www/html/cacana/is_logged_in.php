<?php

declare(strict_types=1);

header('Content-Type: application/json');

session_start();

if (isset($_SESSION['cacanaUsername'])) {
  http_response_code(200);
  echo json_encode([
    'loggedIn' => true,
    'username' => $_SESSION['cacanaUsername']
  ]);
} else {
  http_response_code(200);
  echo json_encode(['loggedIn' => false]);
}
exit();
