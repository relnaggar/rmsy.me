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
    parent::__construct([]);
    $this->secretsService = $secretsService;

    // Microsoft OAuth2 configuration
    $this->clientId = $this->secretsService->getSecret('MS_CLIENT_ID');
    $this->clientSecret = $this->secretsService->getSecret('MS_CLIENT_SECRET');
    $this->redirectUri = $this->secretsService->getSecret('MS_REDIRECT_URI');
    $this->tenant = "consumers"; // for personal accounts only
    $this->scopes = [
      'openid', // to get an ID token
      'profile', // to get basic user info
      'offline_access', // to get a refresh token
      'User.Read', // to read user profile (/me endpoints)
      'Calendars.Read', // to read user calendars
    ];
  }

  public function callback(): Page
  {
    return Page::empty();
  }

  public function login(): Page
  {
    return Page::empty();
  }
}
