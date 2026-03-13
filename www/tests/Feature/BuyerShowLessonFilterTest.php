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

class BuyerShowLessonFilterTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Buyer $buyer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->buyer = Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
    }

    private function show(array $params = []): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($this->user)
            ->get(route('portal.buyers.show', array_merge(['buyer' => $this->buyer], $params)));
    }

    // --- filtering ---

    public function test_show_filters_lessons_by_start_date(): void
    {
        $after = Lesson::factory()->create(['buyer_id' => 'acme', 'datetime' => '2025-06-01 10:00']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'datetime' => '2025-05-31 10:00']);

        $response = $this->show(['start_date' => '2025-06-01']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $after), false);
    }

    public function test_show_filters_lessons_by_end_date(): void
    {
        $before = Lesson::factory()->create(['buyer_id' => 'acme', 'datetime' => '2025-05-31 10:00']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'datetime' => '2025-06-01 10:00']);

        $response = $this->show(['end_date' => '2025-05-31']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $before), false);
    }

    public function test_show_filters_lessons_by_student(): void
    {
        $alice = Student::factory()->create(['name' => 'Alice']);
        $bob = Student::factory()->create(['name' => 'Bob']);
        $aliceLesson = Lesson::factory()->create(['buyer_id' => 'acme', 'student_id' => $alice->id]);
        Lesson::factory()->create(['buyer_id' => 'acme', 'student_id' => $bob->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['student_id' => $alice->id]);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $aliceLesson), false);
    }

    public function test_show_filters_lessons_by_client(): void
    {
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        $clientB = Client::factory()->create(['name' => 'ClientB']);
        $lessonA = Lesson::factory()->create(['buyer_id' => 'acme', 'client_id' => $clientA->id]);
        Lesson::factory()->create(['buyer_id' => 'acme', 'client_id' => $clientB->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['client_id' => $clientA->id]);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $lessonA), false);
    }

    public function test_show_filters_lessons_by_complete(): void
    {
        $incomplete = Lesson::factory()->create(['buyer_id' => 'acme', 'complete' => false]);
        Lesson::factory()->create(['buyer_id' => 'acme', 'complete' => true, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['complete' => 'incomplete']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $incomplete), false);
    }

    public function test_show_only_shows_lessons_for_this_buyer(): void
    {
        $other = Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        $mine = Lesson::factory()->create(['buyer_id' => 'acme']);
        $theirs = Lesson::factory()->create(['buyer_id' => 'other', 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $mine), false);
        $response->assertDontSee(route('portal.lessons.show', $theirs), false);
    }

    // --- default dates ---

    public function test_show_defaults_dates_to_lesson_range_on_first_visit(): void
    {
        Lesson::factory()->create(['buyer_id' => 'acme', 'datetime' => '2025-03-01 10:00']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'datetime' => '2025-09-15 10:00']);

        $response = $this->show();

        $response->assertStatus(200);
        $response->assertSee('value="2025-03-01"', false);
        $response->assertSee('value="2025-09-15"', false);
    }

    public function test_show_respects_explicit_empty_start_date(): void
    {
        Lesson::factory()->create(['buyer_id' => 'acme', 'datetime' => '2025-03-01 10:00']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'datetime' => '2025-09-15 10:00']);

        // When start_date is explicitly submitted as empty, both lessons should be visible
        $response = $this->show(['start_date' => '', 'end_date' => '']);

        $response->assertStatus(200);
        $this->assertCount(2, $response->original->gatherData()['lessons']);
    }

    // --- contextual dropdowns ---

    public function test_show_student_dropdown_only_includes_students_with_lessons_for_this_buyer(): void
    {
        $alice = Student::factory()->create(['name' => 'Alice']);
        $bob = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'student_id' => $alice->id]);
        // Bob has a lesson but with a different buyer
        $other = Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        Lesson::factory()->create(['buyer_id' => 'other', 'student_id' => $bob->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $studentOptions = $response->original->gatherData()['studentOptions'];
        $this->assertContains('Alice', $studentOptions);
        $this->assertNotContains('Bob', $studentOptions);
    }

    public function test_show_student_dropdown_has_all_option_when_multiple_students(): void
    {
        $alice = Student::factory()->create(['name' => 'Alice']);
        $bob = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'student_id' => $alice->id]);
        Lesson::factory()->create(['buyer_id' => 'acme', 'student_id' => $bob->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $studentOptions = $response->original->gatherData()['studentOptions'];
        $this->assertArrayHasKey('', $studentOptions);
        $this->assertEquals('- All -', $studentOptions['']);
    }

    public function test_show_student_dropdown_has_no_all_option_when_single_student(): void
    {
        $alice = Student::factory()->create(['name' => 'Alice']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'student_id' => $alice->id]);

        $response = $this->show();

        $studentOptions = $response->original->gatherData()['studentOptions'];
        $this->assertArrayNotHasKey('', $studentOptions);
    }

    public function test_show_student_dropdown_is_empty_when_no_students(): void
    {
        Lesson::factory()->create(['buyer_id' => 'acme', 'student_id' => null]);

        $response = $this->show();

        $studentOptions = $response->original->gatherData()['studentOptions'];
        $this->assertEmpty($studentOptions);
    }

    public function test_show_client_dropdown_only_includes_clients_with_lessons_for_this_buyer(): void
    {
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        $clientB = Client::factory()->create(['name' => 'ClientB']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'client_id' => $clientA->id]);
        $other = Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        Lesson::factory()->create(['buyer_id' => 'other', 'client_id' => $clientB->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $clientOptions = $response->original->gatherData()['clientOptions'];
        $this->assertContains('ClientA', $clientOptions);
        $this->assertNotContains('ClientB', $clientOptions);
    }

    public function test_show_client_dropdown_has_all_option_when_multiple_clients(): void
    {
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        $clientB = Client::factory()->create(['name' => 'ClientB']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'client_id' => $clientA->id]);
        Lesson::factory()->create(['buyer_id' => 'acme', 'client_id' => $clientB->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $clientOptions = $response->original->gatherData()['clientOptions'];
        $this->assertArrayHasKey('', $clientOptions);
        $this->assertEquals('- All -', $clientOptions['']);
    }

    public function test_show_client_dropdown_has_no_all_option_when_single_client(): void
    {
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        Lesson::factory()->create(['buyer_id' => 'acme', 'client_id' => $clientA->id]);

        $response = $this->show();

        $clientOptions = $response->original->gatherData()['clientOptions'];
        $this->assertArrayNotHasKey('', $clientOptions);
    }

    public function test_show_client_dropdown_is_empty_when_no_clients(): void
    {
        Lesson::factory()->create(['buyer_id' => 'acme', 'client_id' => null]);

        $response = $this->show();

        $clientOptions = $response->original->gatherData()['clientOptions'];
        $this->assertEmpty($clientOptions);
        $response->assertSee('- None -');
    }
}
