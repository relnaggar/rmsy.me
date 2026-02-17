<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    private function createBuyer(string $id, string $name): Buyer
    {
        return Buyer::create(['id' => $id, 'name' => $name]);
    }

    private function createPayment(string $id, array $attributes = []): Payment
    {
        return Payment::create(array_merge([
            'id' => $id,
            'datetime' => now(),
            'amount_gbp_pence' => 5000,
            'currency' => 'GBP',
            'payment_reference' => 'ref',
        ], $attributes));
    }

    private function createLesson(array $attributes): Lesson
    {
        return Lesson::create(array_merge([
            'datetime' => now(),
            'price_gbp_pence' => 5000,
        ], $attributes));
    }

    public function test_dashboard_shows_unpaid_lessons_table(): void
    {
        $buyer = $this->createBuyer('alice', 'Alice Smith');
        $this->createLesson(['datetime' => '2025-01-10 10:00', 'buyer_id' => 'alice', 'price_gbp_pence' => 3000, 'paid' => false]);
        $this->createLesson(['datetime' => '2025-01-12 10:00', 'buyer_id' => 'alice', 'price_gbp_pence' => 2000, 'paid' => false]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertSee('Unpaid Lessons');
        $response->assertSee('Alice Smith');
        $response->assertSee('2');
        $response->assertSee('50.00');
    }

    public function test_dashboard_hides_table_when_no_buyers_qualify(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertDontSee('Unpaid Lessons');
    }

    public function test_dashboard_excludes_buyer_with_only_one_unpaid_lesson(): void
    {
        $buyer = $this->createBuyer('bob', 'Bob Jones');
        $this->createLesson(['datetime' => '2025-01-10 10:00', 'buyer_id' => 'bob', 'price_gbp_pence' => 3000, 'paid' => false]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertDontSee('Unpaid Lessons');
    }

    public function test_dashboard_excludes_paid_lessons_from_count(): void
    {
        $buyer = $this->createBuyer('carol', 'Carol White');
        $this->createLesson(['datetime' => '2025-01-10 10:00', 'buyer_id' => 'carol', 'price_gbp_pence' => 3000, 'paid' => true]);
        $this->createLesson(['datetime' => '2025-01-12 10:00', 'buyer_id' => 'carol', 'price_gbp_pence' => 2000, 'paid' => true]);
        $this->createLesson(['datetime' => '2025-01-14 10:00', 'buyer_id' => 'carol', 'price_gbp_pence' => 1000, 'paid' => false]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertDontSee('Unpaid Lessons');
    }

    public function test_dashboard_shows_unmatched_payments_table(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'payer' => 'John Doe',
            'sequence_number' => '001',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertSee('Unmatched Payments');
        $response->assertSee('PAY-1');
        $response->assertSee('John Doe');
        $response->assertSee('Acme');
        $response->assertSee('Unmatched');
    }

    public function test_dashboard_shows_pending_payments(): void
    {
        $this->createPayment('PAY-2', [
            'datetime' => '2025-02-15 10:00',
            'lesson_pending' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertSee('Unmatched Payments');
        $response->assertSee('PAY-2');
        $response->assertSee('Pending');
    }

    public function test_dashboard_hides_unmatched_section_when_all_matched(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 3000,
        ]);
        $lesson = $this->createLesson([
            'datetime' => '2025-01-08 10:00',
            'buyer_id' => 'acme',
            'price_gbp_pence' => 3000,
            'paid' => true,
        ]);
        $payment->lessons()->attach($lesson);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertDontSee('Unmatched Payments');
    }

    public function test_dashboard_shows_match_button_for_unmatched(): void
    {
        $this->createPayment('PAY-1', ['datetime' => '2025-01-10 10:00']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertSee('Match Payments (1 unmatched)');
    }

    public function test_dashboard_hides_match_button_when_only_pending(): void
    {
        $this->createPayment('PAY-1', [
            'datetime' => '2025-01-10 10:00',
            'lesson_pending' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertSee('Unmatched Payments');
        $response->assertDontSee('Match Payments');
    }
}
