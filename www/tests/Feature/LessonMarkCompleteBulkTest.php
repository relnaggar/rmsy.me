<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonMarkCompleteBulkTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_mark_complete_bulk_requires_authentication(): void
    {
        $lesson = Lesson::factory()->create();

        $this->post(route('portal.lessons.markCompleteBulk'), ['lesson_ids' => [$lesson->id]])
            ->assertRedirect(route('login'));
    }

    public function test_mark_complete_bulk_marks_lessons_as_complete(): void
    {
        $lesson1 = Lesson::factory()->create(['complete' => false]);
        $lesson2 = Lesson::factory()->create(['complete' => false, 'datetime' => '2025-01-20 10:00']);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.markCompleteBulk'), [
                'lesson_ids' => [$lesson1->id, $lesson2->id],
            ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success');
        $this->assertTrue($lesson1->fresh()->complete);
        $this->assertTrue($lesson2->fresh()->complete);
    }

    public function test_mark_complete_bulk_only_marks_selected_lessons(): void
    {
        $lesson1 = Lesson::factory()->create(['complete' => false]);
        $lesson2 = Lesson::factory()->create(['complete' => false, 'datetime' => '2025-01-20 10:00']);

        $this->actingAs($this->user)
            ->post(route('portal.lessons.markCompleteBulk'), [
                'lesson_ids' => [$lesson1->id],
            ]);

        $this->assertTrue($lesson1->fresh()->complete);
        $this->assertFalse($lesson2->fresh()->complete);
    }

    public function test_mark_complete_bulk_preserves_complete_filter_in_redirect(): void
    {
        $lesson = Lesson::factory()->create(['complete' => false]);

        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.markCompleteBulk'), [
                'lesson_ids' => [$lesson->id],
                'complete_filter' => 'incomplete',
            ]);

        $response->assertRedirect(route('portal.lessons.index', ['complete' => 'incomplete']));
    }

    public function test_mark_complete_bulk_requires_lesson_ids(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.markCompleteBulk'), []);

        $response->assertSessionHasErrors('lesson_ids');
    }

    public function test_mark_complete_bulk_rejects_empty_lesson_ids(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.markCompleteBulk'), ['lesson_ids' => []]);

        $response->assertSessionHasErrors('lesson_ids');
    }

    public function test_mark_complete_bulk_rejects_invalid_lesson_ids(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.lessons.markCompleteBulk'), ['lesson_ids' => [99999]]);

        $response->assertSessionHasErrors('lesson_ids.0');
    }
}
