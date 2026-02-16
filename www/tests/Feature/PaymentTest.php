<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
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

    private function createPayment(string $id, array $attributes): Payment
    {
        return Payment::create(array_merge([
            'id' => $id,
            'datetime' => now(),
            'amount_gbp_pence' => 5000,
            'currency' => 'GBP',
            'payment_reference' => 'ref',
        ], $attributes));
    }

    public function test_delete_payment_resequences_invoice_numbers(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $p1 = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'sequence_number' => '001',
        ]);
        $p2 = $this->createPayment('PAY-2', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
            'sequence_number' => '002',
        ]);
        $p3 = $this->createPayment('PAY-3', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-30 10:00',
            'sequence_number' => '003',
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('portal.payments.destroy', $p2));

        $response->assertRedirect(route('portal.payments.index'));
        $this->assertNull(Payment::find('PAY-2'));
        $this->assertEquals('001', Payment::find('PAY-1')->sequence_number);
        $this->assertEquals('002', Payment::find('PAY-3')->sequence_number);
    }

    public function test_delete_payment_only_resequences_same_year(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $p2024 = $this->createPayment('PAY-2024', [
            'buyer_id' => 'acme',
            'datetime' => '2024-06-15 10:00',
            'sequence_number' => '001',
        ]);
        $p2025a = $this->createPayment('PAY-2025-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-03-01 10:00',
            'sequence_number' => '001',
        ]);
        $p2025b = $this->createPayment('PAY-2025-2', [
            'buyer_id' => 'acme',
            'datetime' => '2025-06-01 10:00',
            'sequence_number' => '002',
        ]);

        $this->actingAs($this->user)
            ->delete(route('portal.payments.destroy', $p2025a));

        // 2024 payment unchanged
        $this->assertEquals('001', Payment::find('PAY-2024')->sequence_number);
        // 2025 resequenced
        $this->assertEquals('001', Payment::find('PAY-2025-2')->sequence_number);
    }

    public function test_match_page_prechecks_matched_lessons(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $student = Student::create(['name' => 'Alice']);
        $lesson = Lesson::create([
            'datetime' => '2025-01-15 10:00',
            'price_gbp_pence' => 2500,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);
        $payment->lessons()->attach($lesson->id);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('checked');
    }

    public function test_match_page_does_not_precheck_unmatched_lessons(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $student = Student::create(['name' => 'Alice']);
        $lesson = Lesson::create([
            'datetime' => '2025-01-15 10:00',
            'price_gbp_pence' => 2500,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertDontSee('checked');
    }

    public function test_store_matches_succeeds_when_totals_match(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $student = Student::create(['name' => 'Alice']);
        $lesson1 = Lesson::create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $lesson2 = Lesson::create([
            'datetime' => '2025-01-12 10:00',
            'price_gbp_pence' => 2000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.storeMatches', $payment), [
                'lesson_ids' => [$lesson1->id, $lesson2->id],
            ]);

        $response->assertRedirect(route('portal.payments.show', $payment));
        $response->assertSessionHas('success');
        $this->assertTrue($lesson1->fresh()->paid);
        $this->assertTrue($lesson2->fresh()->paid);
        $this->assertCount(2, $payment->fresh()->lessons);
    }

    public function test_store_matches_fails_when_totals_do_not_match(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $student = Student::create(['name' => 'Alice']);
        $lesson = Lesson::create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.storeMatches', $payment), [
                'lesson_ids' => [$lesson->id],
            ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('lesson_ids');
        $this->assertFalse($lesson->fresh()->paid);
        $this->assertCount(0, $payment->fresh()->lessons);
    }

    public function test_store_matches_fails_with_no_lessons_selected(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.storeMatches', $payment), [
                'lesson_ids' => [],
            ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('lesson_ids');
    }

    public function test_unmatch_removes_lessons_and_marks_unpaid(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $student = Student::create(['name' => 'Alice']);
        $lesson1 = Lesson::create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $lesson2 = Lesson::create([
            'datetime' => '2025-01-12 10:00',
            'price_gbp_pence' => 2000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
        ]);
        $payment->lessons()->attach([$lesson1->id, $lesson2->id]);

        $response = $this->actingAs($this->user)
            ->delete(route('portal.payments.destroyMatches', $payment));

        $response->assertRedirect(route('portal.payments.show', $payment));
        $response->assertSessionHas('success');
        $this->assertFalse($lesson1->fresh()->paid);
        $this->assertFalse($lesson2->fresh()->paid);
        $this->assertCount(0, $payment->fresh()->lessons);
    }

    public function test_unmatch_succeeds_with_no_matches(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('portal.payments.destroyMatches', $payment));

        $response->assertRedirect(route('portal.payments.show', $payment));
        $response->assertSessionHas('success');
    }

    public function test_unmatch_requires_authentication(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->delete(route('portal.payments.destroyMatches', $payment));

        $response->assertRedirect(route('login'));
    }

    public function test_show_has_prev_and_next_links_for_same_buyer(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $p1 = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
        ]);
        $p2 = $this->createPayment('PAY-2', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);
        $p3 = $this->createPayment('PAY-3', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-30 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $p2));

        $response->assertStatus(200);
        $response->assertSee(route('portal.payments.show', $p1), false);
        $response->assertSee(route('portal.payments.show', $p3), false);
    }

    public function test_show_no_prev_next_links_for_single_payment(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme');
        $payment = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertDontSee('Prev', false);
        $response->assertDontSee('Next', false);
    }

    public function test_show_no_prev_next_links_without_buyer(): void
    {
        $payment = $this->createPayment('PAY-1', [
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertDontSee('Prev', false);
        $response->assertDontSee('Next', false);
    }

    public function test_show_prev_next_ignores_other_buyers(): void
    {
        $acme = $this->createBuyer('acme', 'Acme');
        $other = $this->createBuyer('other', 'Other');
        $p1 = $this->createPayment('PAY-1', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
        ]);
        $pOther = $this->createPayment('PAY-OTHER', [
            'buyer_id' => 'other',
            'datetime' => '2025-01-15 10:00',
        ]);
        $p2 = $this->createPayment('PAY-2', [
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $p1));

        $response->assertStatus(200);
        $response->assertSee(route('portal.payments.show', $p2), false);
        $response->assertDontSee(route('portal.payments.show', $pOther), false);
    }

    public function test_free_meeting_button_hidden_on_portal(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertDontSee('Book a free');
    }

    public function test_free_meeting_button_visible_on_public_pages(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertSee('Book a free');
    }
}
