<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlertEscapingTest extends TestCase
{
    use RefreshDatabase;

    public function test_alert_message_escapes_html(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['success' => '<script>alert("xss")</script>'])
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertDontSee('<script>alert("xss")</script>', false);
        $response->assertSee('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;', false);
    }

    public function test_alert_error_message_escapes_html(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['error' => '<img src=x onerror=alert(1)>'])
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertDontSee('<img src=x onerror=alert(1)>', false);
    }
}
