<?php

declare(strict_types=1);

namespace Cacana;

use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth
{
  private const JWT_ALGO = 'HS256';
  private const TOKEN_EXPIRY_DAYS = 90;

  private string $jwtSecret;

  public function __construct()
  {
    $this->jwtSecret = trim(file_get_contents('/run/secrets/JWT_SECRET'));
  }

  public function createToken(string $username): string
  {
    $now = time();
    $payload = [
      'sub' => $username,
      'iat' => $now,
      'exp' => $now + (self::TOKEN_EXPIRY_DAYS * 24 * 60 * 60),
    ];
    return JWT::encode($payload, $this->jwtSecret, self::JWT_ALGO);
  }

  public function validateToken(string $token): ?string
  {
    try {
      $decoded = JWT::decode($token, new Key($this->jwtSecret, self::JWT_ALGO));
      return $decoded->sub;
    } catch (Exception) {
      return null;
    }
  }
}
