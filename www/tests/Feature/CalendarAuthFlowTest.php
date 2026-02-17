<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Client;
use App\Models\Student;
use App\Models\User;
use App\Services\CalendarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CalendarAuthFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_import_redirects_to_oauth_when_not_authorised(): void
    {
        $response = $this->actingAs($this->user)->post(route('portal.lessons.import'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
        ]);

        $response->assertRedirectContains('/auth/login');
    }

    public function test_import_stores_form_data_in_session_before_oauth_redirect(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'ACME', 'name' => 'Acme Co']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $client = Client::factory()->create(['name' => 'ClientA']);

        $response = $this->actingAs($this->user)->post(route('portal.lessons.import'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
            'buyer_id' => $buyer->id,
            'student_id' => (string) $student->id,
            'client_id' => (string) $client->id,
        ]);

        $response->assertRedirectContains('/auth/login');
        $response->assertSessionHas('pending_calendar_import', [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
            'buyer_id' => $buyer->id,
            'student_id' => (string) $student->id,
            'client_id' => (string) $client->id,
        ]);
    }

    public function test_import_proceeds_when_authorised(): void
    {
        $this->user->update([
            'ms_access_token' => 'valid-token',
            'ms_refresh_token' => 'refresh-token',
            'ms_token_expires' => now()->addHour(),
        ]);

        $fakeService = new class extends CalendarService
        {
            protected function getCalendarEvents(string $startDate, string $endDate): array
            {
                return [];
            }
        };
        $this->app->instance(CalendarService::class, $fakeService);

        $response = $this->actingAs($this->user)->post(route('portal.lessons.import'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
        ]);

        $response->assertRedirectToRoute('portal.lessons.index');
        $response->assertSessionHas('success', 'Imported 0 lesson(s).');
    }

    public function test_complete_import_after_auth_performs_import(): void
    {
        $this->user->update([
            'ms_access_token' => 'valid-token',
            'ms_refresh_token' => 'refresh-token',
            'ms_token_expires' => now()->addHour(),
        ]);

        $fakeService = new class extends CalendarService
        {
            protected function getCalendarEvents(string $startDate, string $endDate): array
            {
                return [
                    [
                        'subject' => 'MyTutor Alice/ClientA: Mon 10am £25',
                        'start' => ['dateTime' => '2025-03-01T10:00:00'],
                        'end' => ['dateTime' => '2025-03-01T10:55:00'],
                        'type' => 'singleInstance',
                    ],
                ];
            }
        };
        $this->app->instance(CalendarService::class, $fakeService);

        $response = $this->actingAs($this->user)
            ->withSession(['pending_calendar_import' => [
                'start_date' => '2025-03-01',
                'end_date' => '2025-03-31',
            ]])
            ->get(route('portal.lessons.importComplete'));

        $response->assertRedirectToRoute('portal.lessons.index');
        $response->assertSessionHas('success', 'Imported 1 lesson(s).');
        $this->assertDatabaseCount('lessons', 1);
    }

    public function test_complete_import_after_auth_redirects_when_no_pending_data(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.importComplete'));

        $response->assertRedirectToRoute('portal.lessons.index');
        $response->assertSessionMissing('success');
        $response->assertSessionMissing('error');
    }

    public function test_complete_import_after_auth_redirects_when_not_authorised(): void
    {
        $response = $this->actingAs($this->user)
            ->withSession(['pending_calendar_import' => [
                'start_date' => '2025-03-01',
                'end_date' => '2025-03-31',
            ]])
            ->get(route('portal.lessons.importComplete'));

        $response->assertRedirectToRoute('portal.lessons.index');
        $response->assertSessionMissing('pending_calendar_import');
    }

    public function test_oauth_callback_stores_tokens_on_user(): void
    {
        $state = 'test-state';

        Http::fake([
            'login.microsoftonline.com/*' => Http::response([
                'access_token' => 'new-access-token',
                'refresh_token' => 'new-refresh-token',
                'expires_in' => 3600,
            ]),
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['oauth_state' => $state])
            ->get(route('auth.microsoft.callback', ['state' => $state, 'code' => 'auth-code']));

        $this->user->refresh();
        $this->assertEquals('new-access-token', $this->user->ms_access_token);
        $this->assertEquals('new-refresh-token', $this->user->ms_refresh_token);
        $this->assertNotNull($this->user->ms_token_expires);
    }

    public function test_oauth_callback_redirects_to_import_complete_when_pending(): void
    {
        $state = 'test-state';

        Http::fake([
            'login.microsoftonline.com/*' => Http::response([
                'access_token' => 'new-access-token',
                'refresh_token' => 'new-refresh-token',
                'expires_in' => 3600,
            ]),
        ]);

        $response = $this->actingAs($this->user)
            ->withSession([
                'oauth_state' => $state,
                'pending_calendar_import' => [
                    'start_date' => '2025-03-01',
                    'end_date' => '2025-03-31',
                ],
            ])
            ->get(route('auth.microsoft.callback', ['state' => $state, 'code' => 'auth-code']));

        $response->assertRedirectToRoute('portal.lessons.importComplete');
    }

    public function test_oauth_callback_redirects_to_lessons_index_when_no_pending(): void
    {
        $state = 'test-state';

        Http::fake([
            'login.microsoftonline.com/*' => Http::response([
                'access_token' => 'new-access-token',
                'refresh_token' => 'new-refresh-token',
                'expires_in' => 3600,
            ]),
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['oauth_state' => $state])
            ->get(route('auth.microsoft.callback', ['state' => $state, 'code' => 'auth-code']));

        $response->assertRedirectToRoute('portal.lessons.index');
        $response->assertSessionHas('success');
    }

    public function test_oauth_callback_rejects_invalid_state(): void
    {
        $response = $this->actingAs($this->user)
            ->withSession(['oauth_state' => 'correct-state'])
            ->get(route('auth.microsoft.callback', ['state' => 'wrong-state', 'code' => 'auth-code']));

        $response->assertRedirectToRoute('portal.lessons.index');
        $response->assertSessionHas('error');
    }

    public function test_oauth_routes_require_authentication(): void
    {
        $this->get(route('auth.microsoft'))->assertRedirect('/login');
        $this->get(route('auth.microsoft.callback'))->assertRedirect('/login');
    }

    public function test_import_complete_requires_authentication(): void
    {
        $this->get(route('portal.lessons.importComplete'))->assertRedirect('/login');
    }

    public function test_token_refresh_updates_user_tokens(): void
    {
        $this->user->update([
            'ms_access_token' => 'expired-token',
            'ms_refresh_token' => 'valid-refresh-token',
            'ms_token_expires' => now()->subMinutes(5),
        ]);

        Http::fake([
            'login.microsoftonline.com/*' => Http::response([
                'access_token' => 'refreshed-access-token',
                'refresh_token' => 'new-refresh-token',
                'expires_in' => 3600,
            ]),
            'graph.microsoft.com/v1.0/me/calendars*' => Http::response([
                'value' => [['id' => 'cal-123', 'name' => 'Tutoring']],
            ]),
            'graph.microsoft.com/v1.0/me/calendars/cal-123/*' => Http::response([
                'value' => [],
            ]),
        ]);

        $this->actingAs($this->user)->post(route('portal.lessons.import'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
        ]);

        $this->user->refresh();
        $this->assertEquals('refreshed-access-token', $this->user->ms_access_token);
        $this->assertEquals('new-refresh-token', $this->user->ms_refresh_token);
    }

    public function test_is_authorised_returns_false_when_no_tokens(): void
    {
        $service = new CalendarService;

        $this->actingAs($this->user);
        $this->assertFalse($service->isAuthorised());
    }

    public function test_is_authorised_returns_true_with_valid_token(): void
    {
        $this->user->update([
            'ms_access_token' => 'valid-token',
            'ms_refresh_token' => 'refresh-token',
            'ms_token_expires' => now()->addHour(),
        ]);

        $service = new CalendarService;

        $this->actingAs($this->user);
        $this->assertTrue($service->isAuthorised());
    }

    public function test_is_authorised_returns_true_with_expired_token_and_refresh_token(): void
    {
        $this->user->update([
            'ms_access_token' => 'expired-token',
            'ms_refresh_token' => 'refresh-token',
            'ms_token_expires' => now()->subMinutes(5),
        ]);

        $service = new CalendarService;

        $this->actingAs($this->user);
        $this->assertTrue($service->isAuthorised());
    }

    public function test_is_authorised_returns_false_with_expired_token_and_no_refresh_token(): void
    {
        $this->user->update([
            'ms_access_token' => 'expired-token',
            'ms_refresh_token' => null,
            'ms_token_expires' => now()->subMinutes(5),
        ]);

        $service = new CalendarService;

        $this->actingAs($this->user);
        $this->assertFalse($service->isAuthorised());
    }
}
