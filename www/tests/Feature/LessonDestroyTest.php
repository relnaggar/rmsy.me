<?php

namespace Tests\Feature;

use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonDestroyTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_destroy_requires_authentication(): void
    {
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
        ]);

        $this->delete(route('portal.lessons.destroy', $lesson))
            ->assertRedirect(route('login'));
    }

    public function test_destroy_deletes_lesson(): void
    {
        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('portal.lessons.destroy', $lesson));

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success');
        $this->assertNull(Lesson::find($lesson->id));
    }

    public function test_destroy_returns_404_for_nonexistent_lesson(): void
    {
        $response = $this->actingAs($this->user)
            ->delete(route('portal.lessons.destroy', 99999));

        $response->assertStatus(404);
    }
}
