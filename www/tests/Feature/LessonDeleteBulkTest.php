<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonDeleteBulkTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_delete_bulk_requires_authentication(): void
    {
        $lesson = Lesson::factory()->create();

        $this->post(route('portal.lessons.deleteBulk'), ['lesson_ids' => [$lesson->id]])
            ->assertRedirect(route('login'));
    }

    public function test_delete_bulk_deletes_selected_lessons(): void
    {
        $lesson1 = Lesson::factory()->create();
        $lesson2 = Lesson::factory()->create(['datetime' => '2025-01-20 10:00']);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), [
                'lesson_ids' => [$lesson1->id, $lesson2->id],
            ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success', 'Deleted 2 lesson(s).');
        $this->assertFalse(Lesson::where('id', $lesson1->id)->exists());
        $this->assertFalse(Lesson::where('id', $lesson2->id)->exists());
    }

    public function test_delete_bulk_only_deletes_selected_lessons(): void
    {
        $lesson1 = Lesson::factory()->create();
        $lesson2 = Lesson::factory()->create(['datetime' => '2025-01-20 10:00']);

        $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), [
                'lesson_ids' => [$lesson1->id],
            ]);

        $this->assertFalse(Lesson::where('id', $lesson1->id)->exists());
        $this->assertTrue(Lesson::where('id', $lesson2->id)->exists());
    }

    public function test_delete_bulk_preserves_complete_filter_in_redirect(): void
    {
        $lesson = Lesson::factory()->create();

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), [
                'lesson_ids' => [$lesson->id],
                'complete_filter' => 'incomplete',
            ]);

        $response->assertRedirect(route('portal.lessons.index', ['complete' => 'incomplete']));
    }

    public function test_delete_bulk_preserves_buyer_filter_in_redirect(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);
        $lesson = Lesson::factory()->create(['buyer_id' => 'acme']);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), [
                'lesson_ids' => [$lesson->id],
                'buyer_id' => 'acme',
            ]);

        $response->assertRedirect(route('portal.lessons.index', ['buyer_id' => 'acme']));
    }

    public function test_delete_bulk_preserves_student_filter_in_redirect(): void
    {
        $student = Student::factory()->create();
        $lesson = Lesson::factory()->create(['student_id' => $student->id]);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), [
                'lesson_ids' => [$lesson->id],
                'student_id' => $student->id,
            ]);

        $response->assertRedirect(route('portal.lessons.index', ['student_id' => $student->id]));
    }

    public function test_delete_bulk_preserves_client_filter_in_redirect(): void
    {
        $client = Client::factory()->create();
        $lesson = Lesson::factory()->create(['client_id' => $client->id]);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), [
                'lesson_ids' => [$lesson->id],
                'client_id' => $client->id,
            ]);

        $response->assertRedirect(route('portal.lessons.index', ['client_id' => $client->id]));
    }

    public function test_delete_bulk_preserves_date_filters_in_redirect(): void
    {
        $lesson = Lesson::factory()->create(['datetime' => '2025-06-15 10:00']);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), [
                'lesson_ids' => [$lesson->id],
                'start_date' => '2025-06-01',
                'end_date' => '2025-06-30',
            ]);

        $response->assertRedirect(route('portal.lessons.index', [
            'start_date' => '2025-06-01',
            'end_date' => '2025-06-30',
        ]));
    }

    public function test_delete_bulk_requires_lesson_ids(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), []);

        $response->assertSessionHasErrors('lesson_ids');
    }

    public function test_delete_bulk_rejects_empty_lesson_ids(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), ['lesson_ids' => []]);

        $response->assertSessionHasErrors('lesson_ids');
    }

    public function test_delete_bulk_rejects_invalid_lesson_ids(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.deleteBulk'), ['lesson_ids' => [99999]]);

        $response->assertSessionHasErrors('lesson_ids.0');
    }
}
