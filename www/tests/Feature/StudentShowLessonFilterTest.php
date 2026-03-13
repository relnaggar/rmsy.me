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

class StudentShowLessonFilterTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Student $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->student = Student::factory()->create(['name' => 'Alice']);
    }

    private function show(array $params = []): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($this->user)
            ->get(route('portal.students.show', array_merge(['student' => $this->student], $params)));
    }

    // --- filtering ---

    public function test_show_filters_lessons_by_start_date(): void
    {
        $after = Lesson::factory()->create(['student_id' => $this->student->id, 'datetime' => '2025-06-01 10:00']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'datetime' => '2025-05-31 10:00']);

        $response = $this->show(['start_date' => '2025-06-01']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $after), false);
    }

    public function test_show_filters_lessons_by_end_date(): void
    {
        $before = Lesson::factory()->create(['student_id' => $this->student->id, 'datetime' => '2025-05-31 10:00']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'datetime' => '2025-06-01 10:00']);

        $response = $this->show(['end_date' => '2025-05-31']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $before), false);
    }

    public function test_show_filters_lessons_by_client(): void
    {
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        $clientB = Client::factory()->create(['name' => 'ClientB']);
        $lessonA = Lesson::factory()->create(['student_id' => $this->student->id, 'client_id' => $clientA->id]);
        Lesson::factory()->create(['student_id' => $this->student->id, 'client_id' => $clientB->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['client_id' => $clientA->id]);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $lessonA), false);
    }

    public function test_show_filters_lessons_by_buyer(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        $lessonA = Lesson::factory()->create(['student_id' => $this->student->id, 'buyer_id' => 'acme']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'buyer_id' => 'other', 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['buyer_id' => 'acme']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $lessonA), false);
    }

    public function test_show_filters_lessons_by_complete(): void
    {
        $incomplete = Lesson::factory()->create(['student_id' => $this->student->id, 'complete' => false]);
        Lesson::factory()->create(['student_id' => $this->student->id, 'complete' => true, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['complete' => 'incomplete']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $incomplete), false);
    }

    public function test_show_only_shows_lessons_for_this_student(): void
    {
        $other = Student::factory()->create(['name' => 'Bob']);
        $mine = Lesson::factory()->create(['student_id' => $this->student->id]);
        $theirs = Lesson::factory()->create(['student_id' => $other->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $mine), false);
        $response->assertDontSee(route('portal.lessons.show', $theirs), false);
    }

    // --- default dates ---

    public function test_show_defaults_dates_to_lesson_range_on_first_visit(): void
    {
        Lesson::factory()->create(['student_id' => $this->student->id, 'datetime' => '2025-03-01 10:00']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'datetime' => '2025-09-15 10:00']);

        $response = $this->show();

        $response->assertStatus(200);
        $response->assertSee('value="2025-03-01"', false);
        $response->assertSee('value="2025-09-15"', false);
    }

    public function test_show_respects_explicit_empty_start_date(): void
    {
        Lesson::factory()->create(['student_id' => $this->student->id, 'datetime' => '2025-03-01 10:00']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'datetime' => '2025-09-15 10:00']);

        $response = $this->show(['start_date' => '', 'end_date' => '']);

        $response->assertStatus(200);
        $this->assertCount(2, $response->original->gatherData()['lessons']);
    }

    // --- contextual dropdowns ---

    public function test_show_client_dropdown_only_includes_clients_with_lessons_for_this_student(): void
    {
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        $clientB = Client::factory()->create(['name' => 'ClientB']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'client_id' => $clientA->id]);
        $other = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['student_id' => $other->id, 'client_id' => $clientB->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $clientOptions = $response->original->gatherData()['clientOptions'];
        $this->assertContains('ClientA', $clientOptions);
        $this->assertNotContains('ClientB', $clientOptions);
    }

    public function test_show_client_dropdown_has_all_option_when_multiple_clients(): void
    {
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        $clientB = Client::factory()->create(['name' => 'ClientB']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'client_id' => $clientA->id]);
        Lesson::factory()->create(['student_id' => $this->student->id, 'client_id' => $clientB->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $clientOptions = $response->original->gatherData()['clientOptions'];
        $this->assertArrayHasKey('', $clientOptions);
        $this->assertEquals('- All -', $clientOptions['']);
    }

    public function test_show_client_dropdown_has_no_all_option_when_single_client(): void
    {
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'client_id' => $clientA->id]);

        $response = $this->show();

        $clientOptions = $response->original->gatherData()['clientOptions'];
        $this->assertArrayNotHasKey('', $clientOptions);
    }

    public function test_show_client_dropdown_is_empty_when_no_clients(): void
    {
        Lesson::factory()->create(['student_id' => $this->student->id, 'client_id' => null]);

        $response = $this->show();

        $clientOptions = $response->original->gatherData()['clientOptions'];
        $this->assertEmpty($clientOptions);
    }

    public function test_show_buyer_dropdown_only_includes_buyers_with_lessons_for_this_student(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'buyer_id' => 'acme']);
        $other = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['student_id' => $other->id, 'buyer_id' => 'other', 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $buyerOptions = $response->original->gatherData()['buyerOptions'];
        $this->assertContains('Acme', $buyerOptions);
        $this->assertNotContains('Other', $buyerOptions);
    }

    public function test_show_buyer_dropdown_has_all_option_when_multiple_buyers(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'buyer_id' => 'acme']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'buyer_id' => 'other', 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $buyerOptions = $response->original->gatherData()['buyerOptions'];
        $this->assertArrayHasKey('', $buyerOptions);
        $this->assertEquals('- All -', $buyerOptions['']);
    }

    public function test_show_buyer_dropdown_has_no_all_option_when_single_buyer(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Lesson::factory()->create(['student_id' => $this->student->id, 'buyer_id' => 'acme']);

        $response = $this->show();

        $buyerOptions = $response->original->gatherData()['buyerOptions'];
        $this->assertArrayNotHasKey('', $buyerOptions);
    }

    public function test_show_buyer_dropdown_is_empty_when_no_buyers(): void
    {
        Lesson::factory()->create(['student_id' => $this->student->id, 'buyer_id' => null]);

        $response = $this->show();

        $buyerOptions = $response->original->gatherData()['buyerOptions'];
        $this->assertEmpty($buyerOptions);
        $response->assertSee('- None -');
    }
}
