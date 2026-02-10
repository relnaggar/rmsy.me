<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Auth.php';
require_once __DIR__ . '/../src/Database.php';

use Cacana\Database;
use Cacana\Auth;

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

if (
  !isset($request['username'])
  || !is_string($request['username'])
  || trim($request['username']) === ''
) {
  http_response_code(400);
  echo json_encode(['error' => 'Username is required']);
  exit();
}
$username = trim($request['username']);

if (
  !isset($request['password'])
  || !is_string($request['password'])
  || strlen($request['password']) < 8
) {
  http_response_code(400);
  echo json_encode(['error' => 'Password must be at least 8 characters']);
  exit();
}
$password = $request['password'];

if (
  !isset($request['createdAt'])
  || !is_int($request['createdAt'])
  || $request['createdAt'] <= 0
) {
  http_response_code(400);
  echo json_encode(['error' => 'Valid createdAt timestamp is required']);
  exit();
}
$createdAt = $request['createdAt'];


try {
  $database = new Database();
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
  exit();
}

try {
  $success = $database->registerUser($username, $password, $createdAt);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Database error']);
  exit();
}

if (!$success) {
  http_response_code(409);
  echo json_encode(['error' => 'Username already exists']);
  exit();
}

$auth = new Auth();
$token = $auth->createToken($username);

http_response_code(201);
echo json_encode([
  'success' => true,
  'username' => $username,
  'token' => $token
]);
exit();
