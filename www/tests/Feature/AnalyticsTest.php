<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ExchangeRate;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
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

    public function test_analytics_shows_all_weeks_in_quarter_up_to_current_week(): void
    {
        Carbon::setTestNow('2026-03-14 10:00');

        try {
            ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
            Lesson::factory()->create([
                'datetime' => '2026-01-07 10:00', // week of 2026-01-05 only
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            // Empty weeks between the lesson week and today should appear
            $response->assertSee('2026-01-12');
            // The last full week (2026-03-02) and current week (2026-03-09) should appear
            $response->assertSee('2026-03-02');
            $response->assertSee('2026-03-09');
            // Future weeks should not appear
            $response->assertDontSee('2026-03-16');
            $response->assertDontSee('2026-03-30');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_analytics_shows_total_and_average_rows(): void
    {
        ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
        Lesson::factory()->create([
            'datetime' => '2026-01-07 10:00',
            'complete' => true,
            'price_gbp_pence' => 5000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('Avg/week');
        // Total row: 1 lesson, same GBP/EUR as the single lesson
        $response->assertSee('50.00');
        $response->assertSee('58.83');
    }

    public function test_analytics_shows_current_week_highlighted(): void
    {
        Carbon::setTestNow('2026-03-14 10:00');

        try {
            ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 0.85000]);
            // Past week lesson
            Lesson::factory()->create([
                'datetime' => '2026-01-07 10:00',
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);
            // Current week lesson — should appear highlighted
            ExchangeRate::factory()->create(['date' => '2026-03-09', 'gbpeur' => 0.85000]);
            Lesson::factory()->create([
                'datetime' => '2026-03-10 10:00', // Tuesday of current week
                'complete' => true,
                'price_gbp_pence' => 9000,
            ]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            // Current week IS shown with date and lesson data
            $response->assertSee('2026-03-09');
            $response->assertSee('90.00');
            // Current week row has table-warning class; past week rows do not
            $content = $response->getContent();
            $this->assertStringContainsString('<tr class="table-warning">', $content);
            $this->assertSame(1, substr_count($content, 'class="table-warning"'));
            // "current" badge and avg footnote are present
            $response->assertSee('current');
            $response->assertSee('Avg/week†');
            $response->assertSee('Avg/week excludes the current');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_analytics_avg_excludes_current_week(): void
    {
        // Tuesday Apr 7 — Q2 started Apr 6 (Mon), only lesson is in the current week
        Carbon::setTestNow('2026-04-07 10:00');

        try {
            ExchangeRate::factory()->create(['date' => '2026-04-06', 'gbpeur' => 1.00000]);
            Lesson::factory()->create([
                'datetime' => '2026-04-06 10:00',
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            // Total row includes the current week lesson
            $response->assertSee('2026-04-06');
            $response->assertSee('50.00');
            // Avg is 0 — no completed weeks to average over
            $content = $response->getContent();
            $this->assertStringContainsString('>0.0<', $content); // avg lesson count cell
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_analytics_source_totals_and_averages(): void
    {
        Carbon::setTestNow('2026-03-10 10:00'); // freeze for deterministic week count

        try {
            // Use 1:1 rate for simpler arithmetic
            ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 1.00000]);
            $student = Student::factory()->create(['source' => 'MyTutor']);
            Lesson::factory()->create([
                'datetime' => '2026-01-07 10:00', // week of 2026-01-05
                'complete' => true,
                'price_gbp_pence' => 5000,
                'student_id' => $student->id,
            ]);
            Lesson::factory()->create([
                'datetime' => '2026-01-08 10:00', // same week
                'complete' => true,
                'price_gbp_pence' => 3000,
                'student_id' => $student->id,
            ]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            // Source total GBP: 5000 + 3000 = 8000 pence = 80.00
            $response->assertSee('80.00');
            // Q1 2026 has 9 weeks (Jan 5 through Mar 2) as of Mar 10
            // Source avg GBP: 8000 / 9 = 888.89 pence → round = 889 → 8.89
            $response->assertSee('8.89');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_analytics_assigns_cross_quarter_week_to_quarter_of_week_start(): void
    {
        // Week of 2026-03-30 (Monday) straddles Q1 (Mar 30-31) and Q2 (Apr 1-5)
        Carbon::setTestNow('2026-04-07 10:00'); // Tuesday Apr 7 — week of Mar 30 is the last full week

        try {
            ExchangeRate::factory()->create(['date' => '2026-03-30', 'gbpeur' => 0.85000]);
            // Lesson on March 31 (Q1 month)
            Lesson::factory()->create([
                'datetime' => '2026-03-31 10:00',
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);
            // Lesson on April 1 (Q2 month) — same week, should still appear under Q1
            Lesson::factory()->create([
                'datetime' => '2026-04-01 10:00',
                'complete' => true,
                'price_gbp_pence' => 3000,
            ]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            // Both lessons belong to the week of Mar 30, which is in Q1
            $response->assertSee('2026 T1');
            $response->assertSee('2026-03-30');
            // Combined GBP: 5000 + 3000 = 8000 pence = 80.00 — not split into 50.00 / 30.00
            $response->assertSee('80.00');
            $response->assertDontSee('50.00');
            $response->assertDontSee('30.00');
            // April lesson should NOT create a separate Q2 table
            $response->assertDontSee('2026 T2');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_analytics_assigns_cross_year_week_to_quarter_of_week_start(): void
    {
        // Jan 1 2027 is a Friday — the week of Mon Dec 28 2026 runs Dec 28–Jan 3 2027
        // As of Jan 10 2027 (Sunday), lastFullWeekStart = Dec 28 2026
        Carbon::setTestNow('2027-01-10 10:00');

        try {
            ExchangeRate::factory()->create(['date' => '2026-12-28', 'gbpeur' => 0.85000]);
            // Lesson on Jan 2 2027 (Saturday) — week of Dec 28 2026, which is T4 2026
            Lesson::factory()->create([
                'datetime' => '2027-01-02 10:00',
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            // Week start is Dec 28 2026 (T4), so lesson belongs to 2026 T4
            $response->assertSee('2026 T4');
            $response->assertSee('2026-12-28');
            // Should NOT create a 2027 T1 entry
            $response->assertDontSee('2027 T1');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_analytics_shows_quarter_heading_with_current_week_when_no_full_weeks_yet(): void
    {
        // Tuesday Apr 7 — Q2 started Apr 6 (Mon), first week not yet complete
        Carbon::setTestNow('2026-04-07 10:00');

        try {
            ExchangeRate::factory()->create(['date' => '2026-04-06', 'gbpeur' => 0.85000]);
            Lesson::factory()->create([
                'datetime' => '2026-04-06 10:00', // first Monday of Q2 — current week
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            $response->assertSee('2026 T2');
            // Current week IS shown (highlighted), even though it's not yet complete
            $response->assertSee('2026-04-06');
            $this->assertStringContainsString('<tr class="table-warning">', $response->getContent());
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_analytics_target_can_be_saved(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.analytics.setTarget'), [
                'target_monthly_income_eur' => 3000,
            ]);

        $response->assertRedirect(route('portal.analytics.index'));
        $this->user->refresh();
        $this->assertEquals(300000, $this->user->target_monthly_income_eur_cents);
    }

    public function test_analytics_target_form_shows_saved_value(): void
    {
        $this->user->update(['target_monthly_income_eur_cents' => 300000]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertSee('value="3000"', false);
    }

    public function test_analytics_target_shows_lessons_per_week(): void
    {
        Carbon::setTestNow('2026-03-10 10:00');

        try {
            // 1:1 rate for simpler arithmetic
            ExchangeRate::factory()->create(['date' => '2026-01-05', 'gbpeur' => 1.00000]);
            // 2 lessons at 5000 pence each = 10000 pence total = 100 EUR total
            // 9 weeks in Q1 as of Mar 10
            // avg EUR per lesson = 10000 / 2 = 5000 cents = 50 EUR
            // target 3000 EUR/month ÷ 50 EUR/lesson ÷ (52/12) weeks/month ≈ 13.8 lessons/week
            Lesson::factory()->create([
                'datetime' => '2026-01-07 10:00',
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);
            Lesson::factory()->create([
                'datetime' => '2026-01-14 10:00',
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);
            $this->user->update(['target_monthly_income_eur_cents' => 300000]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            // 300000 / 5000 / (52/12) = 60 / 4.333... = 13.846... ≈ 13.8
            $response->assertSee('13.8');
            $response->assertSee('lessons/week needed');
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_analytics_target_not_shown_when_no_lessons(): void
    {
        $this->user->update(['target_monthly_income_eur_cents' => 300000]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.analytics.index'));

        $response->assertStatus(200);
        $response->assertDontSee('lessons/week needed');
    }

    public function test_analytics_target_not_shown_when_eur_missing(): void
    {
        Carbon::setTestNow('2026-03-10 10:00');

        try {
            // No exchange rate — EUR will be missing
            Lesson::factory()->create([
                'datetime' => '2026-01-07 10:00',
                'complete' => true,
                'price_gbp_pence' => 5000,
            ]);
            $this->user->update(['target_monthly_income_eur_cents' => 300000]);

            $response = $this->actingAs($this->user)
                ->get(route('portal.analytics.index'));

            $response->assertStatus(200);
            $response->assertDontSee('lessons/week needed');
        } finally {
            Carbon::setTestNow();
        }
    }
}
