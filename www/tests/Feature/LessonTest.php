<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonTest extends TestCase
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
        $this->get(route('portal.lessons.index'))
            ->assertRedirect(route('login'));
    }

    public function test_show_requires_authentication(): void
    {
        $lesson = Lesson::factory()->create();

        $this->get(route('portal.lessons.show', $lesson))
            ->assertRedirect(route('login'));
    }

    public function test_update_requires_authentication(): void
    {
        $lesson = Lesson::factory()->create();

        $this->put(route('portal.lessons.update', $lesson), ['price_gbp' => '50.00'])
            ->assertRedirect(route('login'));
    }

    public function test_edit_page_shows_price_field(): void
    {
        $lesson = Lesson::factory()->create(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.show', $lesson));

        $response->assertStatus(200);
        $response->assertSee('Price');
        $response->assertSee('25.00');
    }

    public function test_update_price(): void
    {
        $lesson = Lesson::factory()->create(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '30.00',
            ]);

        $response->assertRedirect(route('portal.lessons.show', $lesson));
        $response->assertSessionHas('success');
        $this->assertEquals(3000, $lesson->fresh()->price_gbp_pence);
    }

    public function test_update_price_with_whole_number(): void
    {
        $lesson = Lesson::factory()->create(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '40',
            ]);

        $response->assertRedirect(route('portal.lessons.show', $lesson));
        $this->assertEquals(4000, $lesson->fresh()->price_gbp_pence);
    }

    public function test_update_price_rejects_negative(): void
    {
        $lesson = Lesson::factory()->create(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '-5.00',
            ]);

        $response->assertSessionHasErrors('price_gbp');
        $this->assertEquals(2500, $lesson->fresh()->price_gbp_pence);
    }

    public function test_update_price_rejects_non_numeric(): void
    {
        $lesson = Lesson::factory()->create(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => 'abc',
            ]);

        $response->assertSessionHasErrors('price_gbp');
        $this->assertEquals(2500, $lesson->fresh()->price_gbp_pence);
    }

    public function test_update_price_is_required(): void
    {
        $lesson = Lesson::factory()->create(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '',
            ]);

        $response->assertSessionHasErrors('price_gbp');
        $this->assertEquals(2500, $lesson->fresh()->price_gbp_pence);
    }

    public function test_apply_to_student_updates_all_lessons_for_student(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson1 = Lesson::factory()->create(['student_id' => $student->id, 'price_gbp_pence' => 2500]);
        $lesson2 = Lesson::factory()->create(['student_id' => $student->id, 'price_gbp_pence' => 2500, 'datetime' => '2025-01-20 10:00']);
        $otherLesson = Lesson::factory()->create(['price_gbp_pence' => 2500, 'datetime' => '2025-01-25 10:00']);

        // Update lesson1's price first
        $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson1), ['price_gbp' => '35.00']);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.applyToStudent', $lesson1));

        $response->assertRedirect(route('portal.lessons.show', $lesson1));
        $response->assertSessionHas('success');
        $this->assertEquals(3500, $lesson1->fresh()->price_gbp_pence);
        $this->assertEquals(3500, $lesson2->fresh()->price_gbp_pence);
        $this->assertEquals(2500, $otherLesson->fresh()->price_gbp_pence);
    }

    public function test_apply_to_student_unmatched_only_skips_paid_lessons(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson1 = Lesson::factory()->create(['student_id' => $student->id, 'price_gbp_pence' => 2500]);
        $paidLesson = Lesson::factory()->create(['student_id' => $student->id, 'price_gbp_pence' => 2500, 'paid' => true, 'datetime' => '2025-01-20 10:00']);
        $unpaidLesson = Lesson::factory()->create(['student_id' => $student->id, 'price_gbp_pence' => 2500, 'datetime' => '2025-01-25 10:00']);

        // Update lesson1's price first
        $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson1), ['price_gbp' => '40.00']);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.applyToStudent', $lesson1), ['unmatched_only' => '1']);

        $response->assertRedirect(route('portal.lessons.show', $lesson1));
        $response->assertSessionHas('success');
        $this->assertEquals(4000, $lesson1->fresh()->price_gbp_pence);
        $this->assertEquals(2500, $paidLesson->fresh()->price_gbp_pence);
        $this->assertEquals(4000, $unpaidLesson->fresh()->price_gbp_pence);
    }

    public function test_apply_to_student_button_shown_when_student_exists(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create(['student_id' => $student->id]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.show', $lesson));

        $response->assertStatus(200);
        $response->assertSee('Update All for Alice');
        $response->assertSee('Update Unmatched for Alice');
    }

    public function test_apply_to_student_button_hidden_when_no_student(): void
    {
        $lesson = Lesson::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.show', $lesson));

        $response->assertStatus(200);
        $response->assertDontSee('Update All for');
        $response->assertDontSee('Update Unmatched for');
    }

    public function test_show_displays_delete_button(): void
    {
        $lesson = Lesson::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.show', $lesson));

        $response->assertStatus(200);
        $response->assertSee('Delete Lesson');
    }

    public function test_edit_page_shows_student_and_client_selects(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);
        $client = Client::factory()->create(['name' => 'Acme Corp']);
        $lesson = Lesson::factory()->create(['student_id' => $student->id, 'client_id' => $client->id]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.show', $lesson));

        $response->assertStatus(200);
        $response->assertSee('Alice');
        $response->assertSee('Acme Corp');
    }

    public function test_update_student(): void
    {
        $student1 = Student::factory()->create(['name' => 'Alice']);
        $student2 = Student::factory()->create(['name' => 'Bob']);
        $lesson = Lesson::factory()->create(['student_id' => $student1->id]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'student_id' => $student2->id,
            ]);

        $response->assertRedirect(route('portal.lessons.show', $lesson));
        $this->assertEquals($student2->id, $lesson->fresh()->student_id);
    }

    public function test_update_client(): void
    {
        $client1 = Client::factory()->create(['name' => 'Acme Corp']);
        $client2 = Client::factory()->create(['name' => 'Globex']);
        $lesson = Lesson::factory()->create(['client_id' => $client1->id]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'client_id' => $client2->id,
            ]);

        $response->assertRedirect(route('portal.lessons.show', $lesson));
        $this->assertEquals($client2->id, $lesson->fresh()->client_id);
    }

    public function test_update_can_clear_student_and_client(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);
        $client = Client::factory()->create(['name' => 'Acme Corp']);
        $lesson = Lesson::factory()->create(['student_id' => $student->id, 'client_id' => $client->id]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'student_id' => '',
                'client_id' => '',
            ]);

        $response->assertRedirect(route('portal.lessons.show', $lesson));
        $this->assertNull($lesson->fresh()->student_id);
        $this->assertNull($lesson->fresh()->client_id);
    }

    public function test_update_rejects_invalid_student(): void
    {
        $lesson = Lesson::factory()->create();

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'student_id' => 9999,
            ]);

        $response->assertSessionHasErrors('student_id');
    }

    public function test_update_rejects_invalid_client(): void
    {
        $lesson = Lesson::factory()->create();

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'client_id' => 9999,
            ]);

        $response->assertSessionHasErrors('client_id');
    }

    public function test_index_shows_payment_link_for_paid_matched_lesson(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $lesson = Lesson::factory()->create(['buyer_id' => 'acme', 'paid' => true]);
        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-20 10:00',
            'amount_gbp_pence' => 5000,
            'buyer_id' => 'acme',
        ]);
        $payment->lessons()->attach($lesson->id);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.index'));

        $response->assertStatus(200);
        $response->assertSee(route('portal.payments.show', $payment), false);
    }

    public function test_index_shows_plain_yes_for_paid_lesson_without_payment(): void
    {
        Lesson::factory()->create(['paid' => true]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.index'));

        $response->assertStatus(200);
        $response->assertSeeInOrder(['Yes']);
        $response->assertDontSee(route('portal.payments.show', 'PAY'), false);
    }

    public function test_index_defaults_start_date_to_latest_lesson(): void
    {
        Lesson::factory()->create(['datetime' => '2025-06-10 14:00']);
        Lesson::factory()->create(['datetime' => '2025-09-20 09:00']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.index'));

        $response->assertStatus(200);
        $response->assertSee('value="2025-09-20"', false);
    }

    public function test_index_defaults_start_date_when_no_lessons(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.index'));

        $response->assertStatus(200);
        $response->assertSee('value="'.now()->subDays(90)->format('Y-m-d').'"', false);
    }

    public function test_index_shows_no_for_unpaid_lesson(): void
    {
        Lesson::factory()->create(['paid' => false]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.index'));

        $response->assertStatus(200);
        $response->assertSee('No');
    }
}
