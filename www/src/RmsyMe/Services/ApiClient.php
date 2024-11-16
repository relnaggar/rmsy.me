<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;

class ApiClient
{
  /**
   * @throws ExceptionInterface
   */
  public function post(string $url, array $body = []): array
  {
    $client = HttpClient::create();
    $response = $client->request('POST', $url, [
      'body' => json_encode($body),
      'headers' => [
        'Content-Type' => 'application/json',
      ],
    ]);
    return $response->toArray();
  }
}
