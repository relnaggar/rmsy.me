<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MicrosoftAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        $clientId = config('services.microsoft.client_id');
        $redirectUri = config('services.microsoft.redirect_uri');
        $scope = 'openid profile email Calendars.Read';

        $state = bin2hex(random_bytes(16));
        session(['oauth_state' => $state]);

        $authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?'.http_build_query([
            'client_id' => $clientId,
            'response_type' => 'code',
            'redirect_uri' => $redirectUri,
            'scope' => $scope,
            'state' => $state,
            'response_mode' => 'query',
        ]);

        return redirect($authUrl);
    }

    public function callback(Request $request): RedirectResponse
    {
        $state = $request->query('state');
        $code = $request->query('code');

        if ($state !== session('oauth_state')) {
            return redirect()->route('portal.dashboard')
                ->with('error', 'Invalid OAuth state. Please try again.');
        }

        session()->forget('oauth_state');

        // Exchange code for tokens
        $response = \Illuminate\Support\Facades\Http::asForm()
            ->post('https://login.microsoftonline.com/common/oauth2/v2.0/token', [
                'client_id' => config('services.microsoft.client_id'),
                'client_secret' => config('services.microsoft.client_secret'),
                'code' => $code,
                'redirect_uri' => config('services.microsoft.redirect_uri'),
                'grant_type' => 'authorization_code',
            ]);

        if ($response->failed()) {
            return redirect()->route('portal.dashboard')
                ->with('error', 'Failed to authenticate with Microsoft.');
        }

        $tokens = $response->json();
        session([
            'ms_access_token' => $tokens['access_token'],
            'ms_refresh_token' => $tokens['refresh_token'] ?? null,
            'ms_token_expires' => now()->addSeconds($tokens['expires_in']),
        ]);

        return redirect()->route('portal.dashboard')
            ->with('success', 'Successfully connected to Microsoft Calendar.');
    }
}
