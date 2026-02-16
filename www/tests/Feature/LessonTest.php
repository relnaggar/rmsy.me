<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Lesson;
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

    private function createLesson(array $attributes = []): Lesson
    {
        return Lesson::create(array_merge([
            'datetime' => '2025-01-15 10:00',
            'price_gbp_pence' => 5000,
        ], $attributes));
    }

    public function test_edit_page_shows_price_field(): void
    {
        $lesson = $this->createLesson(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.edit', $lesson));

        $response->assertStatus(200);
        $response->assertSee('Price');
        $response->assertSee('25.00');
    }

    public function test_update_price(): void
    {
        $lesson = $this->createLesson(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '30.00',
            ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success');
        $this->assertEquals(3000, $lesson->fresh()->price_gbp_pence);
    }

    public function test_update_price_with_whole_number(): void
    {
        $lesson = $this->createLesson(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '40',
            ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $this->assertEquals(4000, $lesson->fresh()->price_gbp_pence);
    }

    public function test_update_price_rejects_negative(): void
    {
        $lesson = $this->createLesson(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '-5.00',
            ]);

        $response->assertSessionHasErrors('price_gbp');
        $this->assertEquals(2500, $lesson->fresh()->price_gbp_pence);
    }

    public function test_update_price_rejects_non_numeric(): void
    {
        $lesson = $this->createLesson(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => 'abc',
            ]);

        $response->assertSessionHasErrors('price_gbp');
        $this->assertEquals(2500, $lesson->fresh()->price_gbp_pence);
    }

    public function test_update_price_is_required(): void
    {
        $lesson = $this->createLesson(['price_gbp_pence' => 2500]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '',
            ]);

        $response->assertSessionHasErrors('price_gbp');
        $this->assertEquals(2500, $lesson->fresh()->price_gbp_pence);
    }

    public function test_apply_to_student_updates_all_lessons_for_student(): void
    {
        $student = Student::create(['name' => 'Alice']);
        $lesson1 = $this->createLesson(['student_id' => $student->id, 'price_gbp_pence' => 2500]);
        $lesson2 = $this->createLesson(['student_id' => $student->id, 'price_gbp_pence' => 2500, 'datetime' => '2025-01-20 10:00']);
        $otherLesson = $this->createLesson(['price_gbp_pence' => 2500, 'datetime' => '2025-01-25 10:00']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson1), [
                'price_gbp' => '35.00',
                'apply_to_student' => '1',
            ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success');
        $this->assertEquals(3500, $lesson1->fresh()->price_gbp_pence);
        $this->assertEquals(3500, $lesson2->fresh()->price_gbp_pence);
        $this->assertEquals(2500, $otherLesson->fresh()->price_gbp_pence);
    }

    public function test_apply_to_student_button_shown_when_student_exists(): void
    {
        $student = Student::create(['name' => 'Alice']);
        $lesson = $this->createLesson(['student_id' => $student->id]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.edit', $lesson));

        $response->assertStatus(200);
        $response->assertSee('Update All for Alice');
    }

    public function test_apply_to_student_button_hidden_when_no_student(): void
    {
        $lesson = $this->createLesson();

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.edit', $lesson));

        $response->assertStatus(200);
        $response->assertDontSee('Update All for');
    }

    public function test_edit_page_shows_student_and_client_selects(): void
    {
        $student = Student::create(['name' => 'Alice']);
        $client = Client::create(['name' => 'Acme Corp']);
        $lesson = $this->createLesson(['student_id' => $student->id, 'client_id' => $client->id]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.lessons.edit', $lesson));

        $response->assertStatus(200);
        $response->assertSee('Alice');
        $response->assertSee('Acme Corp');
    }

    public function test_update_student(): void
    {
        $student1 = Student::create(['name' => 'Alice']);
        $student2 = Student::create(['name' => 'Bob']);
        $lesson = $this->createLesson(['student_id' => $student1->id]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'student_id' => $student2->id,
            ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $this->assertEquals($student2->id, $lesson->fresh()->student_id);
    }

    public function test_update_client(): void
    {
        $client1 = Client::create(['name' => 'Acme Corp']);
        $client2 = Client::create(['name' => 'Globex']);
        $lesson = $this->createLesson(['client_id' => $client1->id]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'client_id' => $client2->id,
            ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $this->assertEquals($client2->id, $lesson->fresh()->client_id);
    }

    public function test_update_can_clear_student_and_client(): void
    {
        $student = Student::create(['name' => 'Alice']);
        $client = Client::create(['name' => 'Acme Corp']);
        $lesson = $this->createLesson(['student_id' => $student->id, 'client_id' => $client->id]);

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'student_id' => '',
                'client_id' => '',
            ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $this->assertNull($lesson->fresh()->student_id);
        $this->assertNull($lesson->fresh()->client_id);
    }

    public function test_update_rejects_invalid_student(): void
    {
        $lesson = $this->createLesson();

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'student_id' => 9999,
            ]);

        $response->assertSessionHasErrors('student_id');
    }

    public function test_update_rejects_invalid_client(): void
    {
        $lesson = $this->createLesson();

        $response = $this->actingAs($this->user)
            ->put(route('portal.lessons.update', $lesson), [
                'price_gbp' => '50.00',
                'client_id' => 9999,
            ]);

        $response->assertSessionHasErrors('client_id');
    }
}
