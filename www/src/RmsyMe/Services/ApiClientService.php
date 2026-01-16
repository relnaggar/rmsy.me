<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\HttpClient\Exception\ExceptionInterface;

class ApiClientService
{
  private $client;

  public function __construct()
  {
    $this->client = HttpClient::create();
  }

  /**
   * Make a POST request to the given URL with the provided body.
   * 
   * @param string $url The URL to send the POST request to.
   * @param array $body The request body as an associative array.
   * @param string $contentType The content type of the request body.
   * @return array The response data as an associative array.
   * @throws ExceptionInterface if the request fails or returns a non-2xx status
   *   code.
   */
  public function post(
    string $url,
    array $body = [],
    string $contentType = 'application/json'
  ): array {
    $response = $this->client->request('POST', $url, [
      'body' => $contentType === 'application/json' ? json_encode($body) : $body,
      'headers' => [
        'Content-Type' => $contentType,
      ],
    ]);
    if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
      return $response->toArray();
    } else {
      throw new ExceptionInterface(
        'API request failed with status code '
        . $response->getStatusCode()
      );
    }
  }
}
