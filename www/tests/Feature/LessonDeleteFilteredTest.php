<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonDeleteFilteredTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    private function createLesson(array $attributes): Lesson
    {
        return Lesson::create(array_merge([
            'datetime' => now(),
            'price_gbp_pence' => 5000,
        ], $attributes));
    }

    public function test_delete_filtered_by_date_range(): void
    {
        $this->createLesson(['datetime' => '2025-03-01 10:00']);
        $this->createLesson(['datetime' => '2025-03-15 10:00']);
        $outside = $this->createLesson(['datetime' => '2025-04-01 10:00']);

        $response = $this->actingAs($this->user)->post(route('portal.lessons.deleteFiltered'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
        ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success', 'Deleted 2 lesson(s).');
        $this->assertEquals(1, Lesson::count());
        $this->assertTrue(Lesson::where('id', $outside->id)->exists());
    }

    public function test_delete_filtered_by_buyer(): void
    {
        $buyer = Buyer::create(['id' => 'acme', 'name' => 'Acme Corp']);
        $this->createLesson(['datetime' => '2025-03-01 10:00', 'buyer_id' => 'acme']);
        $this->createLesson(['datetime' => '2025-03-02 10:00', 'buyer_id' => 'acme']);
        $kept = $this->createLesson(['datetime' => '2025-03-03 10:00']);

        $response = $this->actingAs($this->user)->post(route('portal.lessons.deleteFiltered'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
            'buyer_id' => 'acme',
        ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success', 'Deleted 2 lesson(s).');
        $this->assertEquals(1, Lesson::count());
        $this->assertTrue(Lesson::where('id', $kept->id)->exists());
    }

    public function test_delete_filtered_by_student(): void
    {
        $alice = Student::create(['name' => 'Alice']);
        $bob = Student::create(['name' => 'Bob']);
        $this->createLesson(['datetime' => '2025-03-01 10:00', 'student_id' => $alice->id]);
        $kept = $this->createLesson(['datetime' => '2025-03-02 10:00', 'student_id' => $bob->id]);

        $response = $this->actingAs($this->user)->post(route('portal.lessons.deleteFiltered'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
            'student_id' => $alice->id,
        ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success', 'Deleted 1 lesson(s).');
        $this->assertEquals(1, Lesson::count());
        $this->assertTrue(Lesson::where('id', $kept->id)->exists());
    }

    public function test_delete_filtered_by_client(): void
    {
        $clientA = Client::create(['name' => 'ClientA']);
        $clientB = Client::create(['name' => 'ClientB']);
        $this->createLesson(['datetime' => '2025-03-01 10:00', 'client_id' => $clientA->id]);
        $this->createLesson(['datetime' => '2025-03-02 10:00', 'client_id' => $clientA->id]);
        $kept = $this->createLesson(['datetime' => '2025-03-03 10:00', 'client_id' => $clientB->id]);

        $response = $this->actingAs($this->user)->post(route('portal.lessons.deleteFiltered'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
            'client_id' => $clientA->id,
        ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success', 'Deleted 2 lesson(s).');
        $this->assertEquals(1, Lesson::count());
        $this->assertTrue(Lesson::where('id', $kept->id)->exists());
    }

    public function test_delete_filtered_by_multiple_criteria(): void
    {
        $buyer = Buyer::create(['id' => 'acme', 'name' => 'Acme Corp']);
        $alice = Student::create(['name' => 'Alice']);
        $bob = Student::create(['name' => 'Bob']);
        $this->createLesson(['datetime' => '2025-03-01 10:00', 'buyer_id' => 'acme', 'student_id' => $alice->id]);
        $kept1 = $this->createLesson(['datetime' => '2025-03-02 10:00', 'buyer_id' => 'acme', 'student_id' => $bob->id]);
        $kept2 = $this->createLesson(['datetime' => '2025-03-03 10:00', 'student_id' => $alice->id]);

        $response = $this->actingAs($this->user)->post(route('portal.lessons.deleteFiltered'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
            'buyer_id' => 'acme',
            'student_id' => $alice->id,
        ]);

        $response->assertRedirect(route('portal.lessons.index'));
        $response->assertSessionHas('success', 'Deleted 1 lesson(s).');
        $this->assertEquals(2, Lesson::count());
        $this->assertTrue(Lesson::where('id', $kept1->id)->exists());
        $this->assertTrue(Lesson::where('id', $kept2->id)->exists());
    }

    public function test_delete_filtered_without_filters_deletes_all_in_range(): void
    {
        $this->createLesson(['datetime' => '2025-03-01 10:00']);
        $this->createLesson(['datetime' => '2025-03-15 10:00']);
        $this->createLesson(['datetime' => '2025-03-31 10:00']);

        $response = $this->actingAs($this->user)->post(route('portal.lessons.deleteFiltered'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
        ]);

        $response->assertSessionHas('success', 'Deleted 3 lesson(s).');
        $this->assertEquals(0, Lesson::count());
    }

    public function test_delete_filtered_validates_date_range(): void
    {
        $response = $this->actingAs($this->user)->post(route('portal.lessons.deleteFiltered'), [
            'start_date' => '2025-03-31',
            'end_date' => '2025-03-01',
        ]);

        $response->assertSessionHasErrors('end_date');
    }

    public function test_delete_filtered_requires_authentication(): void
    {
        $this->post(route('portal.lessons.deleteFiltered'), [
            'start_date' => '2025-03-01',
            'end_date' => '2025-03-31',
        ])->assertRedirect(route('login'));
    }
}
