<?php

declare(strict_types=1);

namespace RmsyMe\Controllers;

use Relnaggar\Veloz\{
  Controllers\AbstractController,
  Views\Page,
};

class Auth extends AbstractController
{
  private Secrets $secretsService;

  public function __construct(Secrets $secretsService)
  {
    parent::__construct([]);
    $this->secretsService = $secretsService;
  }

  public function callback(): Page
  {
    $CLIENT_ID = $this->secretsService->getSecret('MS_CLIENT_ID');
    $CLIENT_SECRET = $this->secretsService->getSecret('MS_CLIENT_SECRET');
    $REDIRECT_URI = $this->secretsService->getSecret('MS_REDIRECT_URI');
    $TENANT = "consumers"; // for personal accounts only
    $scopes = [
      'openid', // to get an ID token
      'profile', // to get basic user info
      'offline_access', // to get a refresh token
      'User.Read', // to read user profile
      'Calendars.Read', // to read user calendars
    ];
    return Page::empty();
  }
}
