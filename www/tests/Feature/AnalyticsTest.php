<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ExchangeRate;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_analytics_requires_authentication(): void
    {
        $response = $this->get(route('portal.analytics.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_analytics_shows_empty_state(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('No complete lessons found.');
    }

    public function test_analytics_excludes_incomplete_lessons(): void
    {
        ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
        Lesson::factory()->create([
            'datetime' => '2026-01-07 10:00',
            'complete' => false,
            'price_gbp_pence' => 5000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('No complete lessons found.');
    }

    public function test_analytics_excludes_lessons_before_2026(): void
    {
        ExchangeRate::factory()->create(['date' => '2025-06-01', 'gbpeur' => 0.85000]);
        Lesson::factory()->create([
            'datetime' => '2025-06-04 10:00',
            'complete' => true,
            'price_gbp_pence' => 5000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('No complete lessons found.');
    }

    public function test_analytics_excludes_week_starting_before_2026(): void
    {
        // Jan 1 2026 is a Thursday — its Monday week start is Dec 29 2025, which is excluded
        ExchangeRate::factory()->create(['date' => '2026-01-01', 'gbpeur' => 0.85000]);
        Lesson::factory()->create([
            'datetime' => '2026-01-01 10:00',
            'complete' => true,
            'price_gbp_pence' => 5000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('No complete lessons found.');
    }

    public function test_analytics_shows_lesson_count_gbp_and_eur(): void
    {
        ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
        Lesson::factory()->create([
            'datetime' => '2026-01-07 10:00', // Wednesday — week of Mon 2026-01-05
            'complete' => true,
            'price_gbp_pence' => 5000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('2026-01-05');
        $response->assertSee('50.00'); // GBP
        // EUR = ceil(5000 / 0.85) = ceil(5882.35) = 5883 cents = 58.83
        $response->assertSee('58.83');
    }

    public function test_analytics_uses_payment_date_exchange_rate_for_paid_lessons(): void
    {
        // Lesson in Jan, paid in Feb — EUR should use the Feb rate, not Jan rate
        ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
        ExchangeRate::factory()->create(['date' => '2026-02-02', 'gbpeur' => 0.87000]);

        $lesson = Lesson::factory()->create([
            'datetime' => '2026-01-07 10:00',
            'complete' => true,
            'paid' => true,
            'price_gbp_pence' => 5000,
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2026-02-03 10:00',
            'amount_gbp_pence' => 5000,
        ]);
        $lesson->payments()->attach($payment);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        // EUR using Feb rate: ceil(5000 / 0.87) = ceil(5747.13) = 5748 cents = 57.48
        $response->assertSee('57.48');
        // Jan rate would give ceil(5000 / 0.85) = 5883 cents = 58.83
        $response->assertDontSee('58.83');
    }

    public function test_analytics_uses_lesson_date_exchange_rate_for_unpaid_lessons(): void
    {
        ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
        Lesson::factory()->create([
            'datetime' => '2026-01-07 10:00',
            'complete' => true,
            'paid' => false,
            'price_gbp_pence' => 5000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        // EUR = ceil(5000 / 0.85) = 5883 cents = 58.83
        $response->assertSee('58.83');
    }

    public function test_analytics_shows_source_as_column_header(): void
    {
        ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
        $student = Student::factory()->create(['source' => 'MyTutor']);
        Lesson::factory()->create([
            'datetime' => '2026-01-07 10:00',
            'complete' => true,
            'price_gbp_pence' => 5000,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('MyTutor');
    }

    public function test_analytics_excludes_sourceless_lessons_from_source_columns(): void
    {
        ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
        Lesson::factory()->create([
            'datetime' => '2026-01-07 10:00',
            'complete' => true,
            'price_gbp_pence' => 5000,
            'student_id' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('2026-01-05'); // week row still shown in total
        $response->assertDontSee('MyTutor'); // no source column
    }

    public function test_analytics_groups_into_separate_tables_by_quarter(): void
    {
        ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
        ExchangeRate::factory()->create(['date' => '2026-04-06', 'gbpeur' => 0.86000]);
        Lesson::factory()->create([
            'datetime' => '2026-01-07 10:00', // T1
            'complete' => true,
            'price_gbp_pence' => 5000,
        ]);
        Lesson::factory()->create([
            'datetime' => '2026-04-08 10:00', // T2
            'complete' => true,
            'price_gbp_pence' => 6000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('2026 T1');
        $response->assertSee('2026 T2');
    }
}
