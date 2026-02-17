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

    public function test_index_requires_authentication(): void
    {
        $this->get(route('portal.payments.index'))
            ->assertRedirect(route('login'));
    }

    public function test_show_requires_authentication(): void
    {
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'datetime' => '2025-01-20 10:00']);

        $this->get(route('portal.payments.show', $payment))
            ->assertRedirect(route('login'));
    }

    public function test_update_requires_authentication(): void
    {
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'datetime' => '2025-01-20 10:00']);

        $this->put(route('portal.payments.update', $payment), ['buyer_id' => ''])
            ->assertRedirect(route('login'));
    }

    public function test_destroy_requires_authentication(): void
    {
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'datetime' => '2025-01-20 10:00']);

        $this->delete(route('portal.payments.destroy', $payment))
            ->assertRedirect(route('login'));
    }

    public function test_index_renders_payments_list(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.index'));

        $response->assertStatus(200);
        $response->assertSee('PAY-1');
        $response->assertSee('Acme');
    }

    public function test_index_renders_empty_state(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.index'));

        $response->assertStatus(200);
    }

    public function test_delete_payment_resequences_invoice_numbers(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'sequence_number' => '001',
        ]);
        $p2 = Payment::factory()->create([
            'id' => 'PAY-2',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
            'sequence_number' => '002',
        ]);
        Payment::factory()->create([
            'id' => 'PAY-3',
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
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Payment::factory()->create([
            'id' => 'PAY-2024',
            'buyer_id' => 'acme',
            'datetime' => '2024-06-15 10:00',
            'sequence_number' => '001',
        ]);
        $p2025a = Payment::factory()->create([
            'id' => 'PAY-2025-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-03-01 10:00',
            'sequence_number' => '001',
        ]);
        Payment::factory()->create([
            'id' => 'PAY-2025-2',
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

    public function test_show_displays_payment_id(): void
    {
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('PAY-1');
    }

    public function test_show_displays_matched_status_when_lessons_matched(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-15 10:00',
            'price_gbp_pence' => 5000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);
        $payment->lessons()->attach($lesson->id);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('Matched');
        $response->assertSee('Unmatch All');
    }

    public function test_show_displays_unmatched_status_when_no_lessons_matched(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('Unmatched');
        $response->assertSee('Mark Lesson(s) Pending');
    }

    public function test_show_displays_lesson_pending_status(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
            'lesson_pending' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('Lesson(s) Pending');
        $response->assertSee('Remove');
    }

    public function test_show_matched_payment_shows_lessons_read_only(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-15 10:00',
            'price_gbp_pence' => 5000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);
        $payment->lessons()->attach($lesson->id);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('Alice');
        $response->assertDontSee('Confirm Matches');
        $response->assertDontSee('checkbox', false);
    }

    public function test_show_unmatched_payment_shows_matching_form(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        Lesson::factory()->create([
            'datetime' => '2025-01-15 10:00',
            'price_gbp_pence' => 2500,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('Confirm Matches');
        $response->assertSee('checkbox', false);
    }

    public function test_show_lesson_pending_payment_still_shows_matching_form(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        Lesson::factory()->create([
            'datetime' => '2025-01-15 10:00',
            'price_gbp_pence' => 2500,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
            'lesson_pending' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('Confirm Matches');
        $response->assertSee('checkbox', false);
    }

    public function test_store_matches_succeeds_when_totals_match(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson1 = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $lesson2 = Lesson::factory()->create([
            'datetime' => '2025-01-12 10:00',
            'price_gbp_pence' => 2000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
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

    public function test_store_matches_fails_when_total_exceeds_payment_amount(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 6000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
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
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
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
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson1 = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $lesson2 = Lesson::factory()->create([
            'datetime' => '2025-01-12 10:00',
            'price_gbp_pence' => 2000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
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
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
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
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->delete(route('portal.payments.destroyMatches', $payment));

        $response->assertRedirect(route('login'));
    }

    public function test_show_has_prev_and_next_links_for_same_buyer(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $p1 = Payment::factory()->create(['id' => 'PAY-1', 'buyer_id' => 'acme', 'datetime' => '2025-01-10 10:00']);
        $p2 = Payment::factory()->create(['id' => 'PAY-2', 'buyer_id' => 'acme', 'datetime' => '2025-01-20 10:00']);
        $p3 = Payment::factory()->create(['id' => 'PAY-3', 'buyer_id' => 'acme', 'datetime' => '2025-01-30 10:00']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $p2));

        $response->assertStatus(200);
        $response->assertSee(route('portal.payments.show', $p1), false);
        $response->assertSee(route('portal.payments.show', $p3), false);
    }

    public function test_show_no_prev_next_links_for_single_payment(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'buyer_id' => 'acme', 'datetime' => '2025-01-20 10:00']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertDontSee('Prev', false);
        $response->assertDontSee('Next', false);
    }

    public function test_show_no_prev_next_links_without_buyer(): void
    {
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'datetime' => '2025-01-20 10:00']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertDontSee('Prev', false);
        $response->assertDontSee('Next', false);
    }

    public function test_show_prev_next_ignores_other_buyers(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        $p1 = Payment::factory()->create(['id' => 'PAY-1', 'buyer_id' => 'acme', 'datetime' => '2025-01-10 10:00']);
        $pOther = Payment::factory()->create(['id' => 'PAY-OTHER', 'buyer_id' => 'other', 'datetime' => '2025-01-15 10:00']);
        $p2 = Payment::factory()->create(['id' => 'PAY-2', 'buyer_id' => 'acme', 'datetime' => '2025-01-20 10:00']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $p1));

        $response->assertStatus(200);
        $response->assertSee(route('portal.payments.show', $p2), false);
        $response->assertDontSee(route('portal.payments.show', $pOther), false);
    }

    public function test_toggle_lesson_pending_marks_payment_as_pending(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'buyer_id' => 'acme', 'datetime' => '2025-01-20 10:00']);

        $this->assertFalse($payment->fresh()->lesson_pending);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.toggleLessonPending', $payment));

        $response->assertRedirect(route('portal.payments.show', $payment));
        $this->assertTrue($payment->fresh()->lesson_pending);
    }

    public function test_toggle_lesson_pending_removes_pending_flag(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
            'lesson_pending' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.toggleLessonPending', $payment));

        $response->assertRedirect(route('portal.payments.show', $payment));
        $this->assertFalse($payment->fresh()->lesson_pending);
    }

    public function test_match_next_skips_lesson_pending_payments(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Payment::factory()->create([
            'id' => 'PAY-PENDING',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'lesson_pending' => true,
        ]);
        $normalPayment = Payment::factory()->create([
            'id' => 'PAY-NORMAL',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.matchNext'));

        $response->assertRedirect(route('portal.payments.show', [
            'payment' => $normalPayment,
            'next' => 1,
        ]));
    }

    public function test_match_next_all_done_when_only_pending_remain(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Payment::factory()->create([
            'id' => 'PAY-PENDING',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'lesson_pending' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.matchNext'));

        $response->assertRedirect(route('portal.dashboard'));
        $response->assertSessionHas('success');
    }

    public function test_index_shows_lesson_pending_label(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Payment::factory()->create([
            'id' => 'PAY-PENDING',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'lesson_pending' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.index'));

        $response->assertStatus(200);
        $response->assertSee('Lesson(s) Pending');
    }

    public function test_show_displays_delete_button(): void
    {
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'datetime' => '2025-01-20 10:00']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('Delete Payment');
    }

    public function test_update_buyer_via_inline_form(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'datetime' => '2025-01-20 10:00']);

        $this->assertNull($payment->buyer_id);

        $response = $this->actingAs($this->user)
            ->put(route('portal.payments.update', $payment), [
                'buyer_id' => 'acme',
            ]);

        $response->assertRedirect(route('portal.payments.show', $payment));
        $this->assertEquals('acme', $payment->fresh()->buyer_id);
    }

    public function test_update_buyer_to_none(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.payments.update', $payment), [
                'buyer_id' => '',
            ]);

        $response->assertRedirect(route('portal.payments.show', $payment));
        $this->assertNull($payment->fresh()->buyer_id);
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

    public function test_store_matches_succeeds_with_partial_match(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.storeMatches', $payment), [
                'lesson_ids' => [$lesson->id],
            ]);

        $response->assertRedirect(route('portal.payments.show', $payment));
        $response->assertSessionHas('success');
        $this->assertTrue($lesson->fresh()->paid);
        $this->assertCount(1, $payment->fresh()->lessons);
        $this->assertTrue($payment->fresh()->lesson_pending);
    }

    public function test_full_match_sets_lesson_pending_false(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson1 = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $lesson2 = Lesson::factory()->create([
            'datetime' => '2025-01-12 10:00',
            'price_gbp_pence' => 2000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
        ]);

        $this->actingAs($this->user)
            ->post(route('portal.payments.storeMatches', $payment), [
                'lesson_ids' => [$lesson1->id, $lesson2->id],
            ]);

        $this->assertFalse($payment->fresh()->lesson_pending);
    }

    public function test_second_partial_match_adds_to_existing(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson1 = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $lesson2 = Lesson::factory()->create([
            'datetime' => '2025-01-12 10:00',
            'price_gbp_pence' => 2000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
        ]);

        $this->actingAs($this->user)
            ->post(route('portal.payments.storeMatches', $payment), [
                'lesson_ids' => [$lesson1->id],
            ]);

        $this->assertCount(1, $payment->fresh()->lessons);
        $this->assertTrue($payment->fresh()->lesson_pending);

        $this->actingAs($this->user)
            ->post(route('portal.payments.storeMatches', $payment), [
                'lesson_ids' => [$lesson2->id],
            ]);

        $this->assertCount(2, $payment->fresh()->lessons);
        $this->assertFalse($payment->fresh()->lesson_pending);
    }

    public function test_show_partially_matched_shows_both_tables(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson1 = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        Lesson::factory()->create([
            'datetime' => '2025-01-12 10:00',
            'price_gbp_pence' => 2000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
            'lesson_pending' => true,
        ]);
        $payment->lessons()->attach($lesson1->id);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.show', $payment));

        $response->assertStatus(200);
        $response->assertSee('Matched Lessons');
        $response->assertSee('Match More Lessons');
        $response->assertSee('Confirm Matches');
        $response->assertSee('Unmatch All');
    }

    public function test_unmatch_all_resets_lesson_pending(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
            'lesson_pending' => true,
        ]);
        $payment->lessons()->attach($lesson->id);

        $this->actingAs($this->user)
            ->delete(route('portal.payments.destroyMatches', $payment));

        $this->assertFalse($payment->fresh()->lesson_pending);
        $this->assertCount(0, $payment->fresh()->lessons);
    }

    public function test_match_next_skips_partially_matched_payments(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $partialPayment = Payment::factory()->create([
            'id' => 'PAY-PARTIAL',
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-10 10:00',
            'lesson_pending' => true,
        ]);
        $partialPayment->lessons()->attach($lesson->id);

        $normalPayment = Payment::factory()->create([
            'id' => 'PAY-NORMAL',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.payments.matchNext'));

        $response->assertRedirect(route('portal.payments.show', [
            'payment' => $normalPayment,
            'next' => 1,
        ]));
    }

    public function test_toggle_lesson_pending_blocked_when_lessons_matched(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
            'paid' => true,
        ]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'amount_gbp_pence' => 5000,
            'datetime' => '2025-01-20 10:00',
            'lesson_pending' => true,
        ]);
        $payment->lessons()->attach($lesson->id);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.toggleLessonPending', $payment));

        $response->assertRedirect(route('portal.payments.show', $payment));
        $this->assertTrue($payment->fresh()->lesson_pending);
    }
}
