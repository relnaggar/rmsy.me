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

class ClientShowLessonFilterTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Client $client;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->client = Client::factory()->create(['name' => 'Acme']);
    }

    private function show(array $params = []): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($this->user)
            ->get(route('portal.clients.show', array_merge(['client' => $this->client], $params)));
    }

    // --- filtering ---

    public function test_show_filters_lessons_by_start_date(): void
    {
        $after = Lesson::factory()->create(['client_id' => $this->client->id, 'datetime' => '2025-06-01 10:00']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'datetime' => '2025-05-31 10:00']);

        $response = $this->show(['start_date' => '2025-06-01']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $after), false);
    }

    public function test_show_filters_lessons_by_end_date(): void
    {
        $before = Lesson::factory()->create(['client_id' => $this->client->id, 'datetime' => '2025-05-31 10:00']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'datetime' => '2025-06-01 10:00']);

        $response = $this->show(['end_date' => '2025-05-31']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $before), false);
    }

    public function test_show_filters_lessons_by_student(): void
    {
        $alice = Student::factory()->create(['name' => 'Alice']);
        $bob = Student::factory()->create(['name' => 'Bob']);
        $aliceLesson = Lesson::factory()->create(['client_id' => $this->client->id, 'student_id' => $alice->id]);
        Lesson::factory()->create(['client_id' => $this->client->id, 'student_id' => $bob->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['student_id' => $alice->id]);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $aliceLesson), false);
    }

    public function test_show_filters_lessons_by_buyer(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        $lessonA = Lesson::factory()->create(['client_id' => $this->client->id, 'buyer_id' => 'acme']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'buyer_id' => 'other', 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['buyer_id' => 'acme']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $lessonA), false);
    }

    public function test_show_filters_lessons_by_complete(): void
    {
        $incomplete = Lesson::factory()->create(['client_id' => $this->client->id, 'complete' => false]);
        Lesson::factory()->create(['client_id' => $this->client->id, 'complete' => true, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['complete' => 'incomplete']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $incomplete), false);
    }

    public function test_show_filters_lessons_by_paid(): void
    {
        $unpaid = Lesson::factory()->create(['client_id' => $this->client->id, 'paid' => false]);
        Lesson::factory()->create(['client_id' => $this->client->id, 'paid' => true, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show(['paid' => 'unpaid']);

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $unpaid), false);
    }

    public function test_show_only_shows_lessons_for_this_client(): void
    {
        $other = Client::factory()->create(['name' => 'Other']);
        $mine = Lesson::factory()->create(['client_id' => $this->client->id]);
        $theirs = Lesson::factory()->create(['client_id' => $other->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $response->assertStatus(200);
        $this->assertCount(1, $response->original->gatherData()['lessons']);
        $response->assertSee(route('portal.lessons.show', $mine), false);
        $response->assertDontSee(route('portal.lessons.show', $theirs), false);
    }

    // --- default dates ---

    public function test_show_defaults_dates_to_lesson_range_on_first_visit(): void
    {
        Lesson::factory()->create(['client_id' => $this->client->id, 'datetime' => '2025-03-01 10:00']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'datetime' => '2025-09-15 10:00']);

        $response = $this->show();

        $response->assertStatus(200);
        $response->assertSee('value="2025-03-01"', false);
        $response->assertSee('value="2025-09-15"', false);
    }

    public function test_show_respects_explicit_empty_start_date(): void
    {
        Lesson::factory()->create(['client_id' => $this->client->id, 'datetime' => '2025-03-01 10:00']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'datetime' => '2025-09-15 10:00']);

        $response = $this->show(['start_date' => '', 'end_date' => '']);

        $response->assertStatus(200);
        $this->assertCount(2, $response->original->gatherData()['lessons']);
    }

    // --- contextual dropdowns ---

    public function test_show_student_dropdown_only_includes_students_with_lessons_for_this_client(): void
    {
        $alice = Student::factory()->create(['name' => 'Alice']);
        $bob = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'student_id' => $alice->id]);
        $other = Client::factory()->create(['name' => 'Other']);
        Lesson::factory()->create(['client_id' => $other->id, 'student_id' => $bob->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $studentOptions = $response->original->gatherData()['studentOptions'];
        $this->assertContains('Alice', $studentOptions);
        $this->assertNotContains('Bob', $studentOptions);
    }

    public function test_show_student_dropdown_has_all_option_when_multiple_students(): void
    {
        $alice = Student::factory()->create(['name' => 'Alice']);
        $bob = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'student_id' => $alice->id]);
        Lesson::factory()->create(['client_id' => $this->client->id, 'student_id' => $bob->id, 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $studentOptions = $response->original->gatherData()['studentOptions'];
        $this->assertArrayHasKey('', $studentOptions);
        $this->assertEquals('- All -', $studentOptions['']);
    }

    public function test_show_student_dropdown_has_no_all_option_when_single_student(): void
    {
        $alice = Student::factory()->create(['name' => 'Alice']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'student_id' => $alice->id]);

        $response = $this->show();

        $studentOptions = $response->original->gatherData()['studentOptions'];
        $this->assertArrayNotHasKey('', $studentOptions);
    }

    public function test_show_buyer_dropdown_only_includes_buyers_with_lessons_for_this_client(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'buyer_id' => 'acme']);
        $otherClient = Client::factory()->create(['name' => 'OtherClient']);
        Lesson::factory()->create(['client_id' => $otherClient->id, 'buyer_id' => 'other', 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $buyerOptions = $response->original->gatherData()['buyerOptions'];
        $this->assertContains('Acme', $buyerOptions);
        $this->assertNotContains('Other', $buyerOptions);
    }

    public function test_show_student_dropdown_is_empty_when_no_students(): void
    {
        Lesson::factory()->create(['client_id' => $this->client->id, 'student_id' => null]);

        $response = $this->show();

        $studentOptions = $response->original->gatherData()['studentOptions'];
        $this->assertEmpty($studentOptions);
        $response->assertSee('- None -');
    }

    public function test_show_buyer_dropdown_has_all_option_when_multiple_buyers(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Buyer::factory()->create(['id' => 'other', 'name' => 'Other']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'buyer_id' => 'acme']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'buyer_id' => 'other', 'datetime' => '2025-01-20 10:00']);

        $response = $this->show();

        $buyerOptions = $response->original->gatherData()['buyerOptions'];
        $this->assertArrayHasKey('', $buyerOptions);
        $this->assertEquals('- All -', $buyerOptions['']);
    }

    public function test_show_buyer_dropdown_has_no_all_option_when_single_buyer(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Lesson::factory()->create(['client_id' => $this->client->id, 'buyer_id' => 'acme']);

        $response = $this->show();

        $buyerOptions = $response->original->gatherData()['buyerOptions'];
        $this->assertArrayNotHasKey('', $buyerOptions);
    }

    public function test_show_buyer_dropdown_is_empty_when_no_buyers(): void
    {
        Lesson::factory()->create(['client_id' => $this->client->id, 'buyer_id' => null]);

        $response = $this->show();

        $buyerOptions = $response->original->gatherData()['buyerOptions'];
        $this->assertEmpty($buyerOptions);
        $response->assertSee('- None -');
    }
}
