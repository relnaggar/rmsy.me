<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../src/Auth.php';

use Cacana\Auth;

header('Content-Type: application/json');

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
  echo json_encode(['loggedIn' => false]);
  exit();
}

$auth = new Auth();
$username = $auth->validateToken($matches[1]);

echo json_encode($username
  ? ['loggedIn' => true, 'username' => $username]
  : ['loggedIn' => false]
);
exit();
