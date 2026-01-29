<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use DateTimeImmutable;
use DateTimeZone;
use DateTimeInterface;
use Microsoft\Graph\Core\GraphClientFactory;
use GuzzleHttp\Client;
use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\Services\{
  SecretsService,
  ApiClientService,
};

class MicrosoftAuthController extends AbstractController
{
  private SecretsService $secretsService;
  private ApiClientService $apiClientService;
  private string $clientId;
  private string $clientSecret;
  private string $redirectUri;
  private string $tenant;
  private array $scopes;
  private string $authority;
  private ?Client $client;

  public function __construct(
    SecretsService $secretsService,
    ApiClientService $apiClientService,
  ) {
    if (session_status() === PHP_SESSION_NONE) {
      session_start();
    }

    parent::__construct([]);
    $this->secretsService = $secretsService;
    $this->apiClientService = $apiClientService;

    // Microsoft OAuth2 configuration
    $this->clientId = $this->secretsService->getSecret('MS_CLIENT_ID');
    $this->clientSecret = $this->secretsService->getSecret('MS_CLIENT_SECRET');
    $this->redirectUri = $this->secretsService->getSecret('MS_REDIRECT_URI');
    $this->tenant = "consumers"; // for personal accounts only
    $this->scopes = [
      // 'openid', // to get an ID token
      // 'profile', // to get basic user info
      'offline_access', // to get a refresh token
      // 'User.Read', // to read user profile (/me endpoints)
      'Calendars.Read', // to read user calendars
    ];
    $this->authority = "https://login.microsoftonline.com/{$this->tenant}/oauth2/v2.0";
    $this->client = null;
  }

  public function callback(): Page
  {
    // handle errors from OAuth provider
    if (isset($_GET['error'])) {
      $desc = $_GET['error_description'] ?? '';
      http_response_code(400);
      echo "OAuth error: " . htmlspecialchars($_GET['error']) . "<br>";
      echo htmlspecialchars($desc);
      exit();
    }

    // validate state parameter to prevent CSRF
    $sentState = $_GET['state'] ?? '';
    $expectedState = $_SESSION['oauth2_state'] ?? '';
    unset($_SESSION['oauth2_state']); // one-time use
    if (!$sentState || !$expectedState || !hash_equals($expectedState, $sentState)) {
      http_response_code(400);
      echo "Invalid state. Please try signing in again.";
      exit();
    }

    // get authorization code
    $code = $_GET['code'] ?? '';
    if (!$code) {
      http_response_code(400);
      echo "Missing authorization code.";
      exit();
    }

    // exchange authorisation code for tokens
    $responseData = $this->apiClientService->post(
      url: "$this->authority/token",
      body: [
        'client_id' => $this->clientId,
        'scope' => implode(' ', $this->scopes),
        'code' => $code,
        'redirect_uri' => $this->redirectUri,
        'grant_type' => 'authorization_code',
        'client_secret' => $this->clientSecret,
      ],
      contentType: 'application/x-www-form-urlencoded',
    );
    // store tokens in session
    $_SESSION['MS_ACCESS_TOKEN'] = $responseData['access_token'];
    $_SESSION['MS_REFRESH_TOKEN'] = $responseData['refresh_token'] ?? null;
    $_SESSION['MS_EXPIRES_AT'] = time() + (int)($responseData['expires_in']);
    $_SESSION['MS_ID_TOKEN'] = $responseData['id_token'] ?? null;

    $this->redirect('/portal/lessons', 303);
    return Page::empty();
  }

  public function login(): Page
  {
    $state = bin2hex(random_bytes(16)); // CSRF token
    $_SESSION['oauth2_state'] = $state;

    $params = [
      'client_id' => $this->clientId,
      'response_type' => 'code',
      'redirect_uri' => $this->redirectUri,
      'response_mode' => 'query',
      'scope' => implode(' ', $this->scopes),
      'state' => $state,
      // 'prompt' => 'select_account', // allow user to choose account each time
    ];
    $authorizeUrl = "$this->authority/authorize?" . http_build_query($params);

    $this->redirect($authorizeUrl, 303);
    return Page::empty();
  }

  /**
   * Ensure a valid access token is available in the session or by refreshing
   * with a refresh token. If not possible, redirect to login.
   * 
   * @return string The valid access token.
   */
  private function ensureAccessToken(): string
  {
    // if no access token, redirect to login
    if (
      empty($_SESSION['MS_ACCESS_TOKEN'])
      || empty($_SESSION['MS_EXPIRES_AT'])
    ) {
      $this->redirect('/auth/login', 303);
    }

    // valid until 60 seconds before expiry
    if (time() < ($_SESSION['MS_EXPIRES_AT'] - 60)) {
      return $_SESSION['MS_ACCESS_TOKEN'];
    }

    // access token expired; attempt to refresh

    $refreshToken = $_SESSION['MS_REFRESH_TOKEN'] ?? null;
    // if no refresh token, redirect to login
    if (!$refreshToken) {
      $this->redirect('/auth/login', 303);
    }

    // use refresh token to get new access token
    try {
      $responseData = $this->apiClientService->post(
        url: "$this->authority/token",
        body: [
          'client_id' => $this->clientId,
          'client_secret' => $this->clientSecret,
          'grant_type' => 'refresh_token',
          'refresh_token' => $refreshToken,
          'redirect_uri' => $this->redirectUri,
          'scope' => implode(' ', $this->scopes),
        ],
        contentType: 'application/x-www-form-urlencoded',
      );
    // if refresh fails, redirect to login
    } catch (ExceptionInterface) {
      $this->redirect('/auth/login', 303);
    }

    $_SESSION['MS_ACCESS_TOKEN']  = $responseData['access_token'];
    if (!empty($responseData['refresh_token'])) {
      $_SESSION['MS_REFRESH_TOKEN'] = $responseData['refresh_token'];
    }
    $_SESSION['MS_EXPIRES_AT'] = time() + (int)($responseData['expires_in']);

    return $_SESSION['MS_ACCESS_TOKEN'];
  }

  private function getClient(): Client
  {
    if ($this->client !== null) {
      return $this->client;
    }

    $accessToken = $this->ensureAccessToken();
    $this->client = GraphClientFactory::createWithConfig([
      'headers' => [
        'Authorization' => "Bearer $accessToken",
      ],
    ]);
    return $this->client;
  }

  private function getCalendarId(string $calendarName): string
  {
    if (!empty($_SESSION['MS_CALENDAR_ID'])) {
      return $_SESSION['MS_CALENDAR_ID'];
    }

    $client = $this->getClient();
    $response = $client->get('/v1.0/me/calendars?$select=id,name');
    $responseData = json_decode($response->getBody()->getContents(), true);

    foreach ($responseData['value'] as $calendar) {
      if ($calendar['name'] === $calendarName) {
        $_SESSION['MS_CALENDAR_ID'] = $calendar['id'];
        break;
      }
    }
    if (empty($_SESSION['MS_CALENDAR_ID'])) {
      throw new RuntimeException("Calendar '$calendarName' not found.");
    }

    return $_SESSION['MS_CALENDAR_ID'];
  }

  public function getCalendarEvents(): array
  {
    $client = $this->getClient();
    $calendarId = $this->getCalendarId('Tutoring');

    $now = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);
    $start = (new DateTimeImmutable('-90 days', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM);
    $endpoint = "/v1.0/me/calendars/$calendarId/calendarView"
      . '?startDateTime=' . urlencode($start)
      . '&endDateTime=' . urlencode($now)
      . '&$top=1000'
      . '&$orderby=start/dateTime desc'
      . '&$select=subject,start,end,type'; // seriesMasterId would give recurring info

    $response = $client->get($endpoint);
    $responseData = json_decode($response->getBody()->getContents(), true);
    $events = $responseData['value'] ?? [];
    return $events;
  }
}
