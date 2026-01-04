<?php

declare(strict_types=1);

require_once '/vendor/autoload.php';

use Relnaggar\Veloz\Config;
Config::getInstance()->set('sourceDirectory', __DIR__ . '/../../src/');

require_once '/vendor/relnaggar/veloz/autoload.php';

use Cacana\Database;

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

if (!isset($request['username']) || !is_string($request['username'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Username is required']);
  exit();
}

if (!isset($request['password']) || !is_string($request['password'])) {
  http_response_code(400);
  echo json_encode(['error' => 'Password is required']);
  exit();
}

$username = trim($request['username']);
$password = $request['password'];

try {
  $database = new Database();
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
  exit();
}

try {
  $valid = $database->verifyUser($username, $password);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
  exit();
}

if (!$valid) {
  http_response_code(401);
  echo json_encode(['error' => 'Invalid username or password']);
  exit();
}

session_start();
$_SESSION['cacanaUsername'] = $username;

http_response_code(200);
echo json_encode(['success' => true, 'username' => $username]);
exit();
