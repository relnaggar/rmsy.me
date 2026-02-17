<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MicrosoftAuthController extends Controller
{
    private string $tenant;

    private string $scope;

    private string $authority;

    public function __construct()
    {
        $this->tenant = config('services.microsoft.tenant', 'consumers');
        $this->scope = 'offline_access Calendars.Read';
        $this->authority = "https://login.microsoftonline.com/{$this->tenant}/oauth2/v2.0";
    }

    public function redirect(): RedirectResponse
    {
        $state = bin2hex(random_bytes(16));
        session(['oauth_state' => $state]);

        $authUrl = "{$this->authority}/authorize?".http_build_query([
            'client_id' => config('services.microsoft.client_id'),
            'response_type' => 'code',
            'redirect_uri' => config('services.microsoft.redirect_uri'),
            'scope' => $this->scope,
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
            return redirect()->route('portal.lessons.index')
                ->with('error', 'Invalid OAuth state. Please try again.');
        }

        session()->forget('oauth_state');

        /** @var PendingRequest $response */
        $response = Http::asForm()
            ->post("{$this->authority}/token", [
                'client_id' => config('services.microsoft.client_id'),
                'client_secret' => config('services.microsoft.client_secret'),
                'code' => $code,
                'redirect_uri' => config('services.microsoft.redirect_uri'),
                'grant_type' => 'authorization_code',
                'scope' => $this->scope,
            ]);

        if ($response->failed()) {
            return redirect()->route('portal.lessons.index')
                ->with('error', 'Failed to authenticate with Microsoft.');
        }

        $tokens = $response->json();
        $request->user()->update([
            'ms_access_token' => $tokens['access_token'],
            'ms_refresh_token' => $tokens['refresh_token'] ?? null,
            'ms_token_expires' => now()->addSeconds($tokens['expires_in']),
        ]);

        if (session()->has('pending_calendar_import')) {
            return redirect()->route('portal.lessons.importComplete');
        }

        return redirect()->route('portal.lessons.index')
            ->with('success', 'Successfully connected to Microsoft Calendar.');
    }
}
