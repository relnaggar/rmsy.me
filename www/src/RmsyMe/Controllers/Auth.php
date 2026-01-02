<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};
use RmsyMe\Services\Secrets;

class Auth extends AbstractController
{
  private Secrets $secretsService;
  private string $clientId;
  private string $clientSecret;
  private string $redirectUri;
  private string $tenant;
  private array $scopes;

  public function __construct(Secrets $secretsService)
  {
    session_start();

    parent::__construct([]);
    $this->secretsService = $secretsService;

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

    // TODO exchange authorisation code for tokens

    echo "Authorization successful! You can close this window.";
    exit();
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
    $authorizeUrl = "https://login.microsoftonline.com/{$this->tenant}/oauth2/v2.0/authorize?" . http_build_query($params);

    $this->redirect($authorizeUrl, 302);
    return Page::empty();
  }
}
