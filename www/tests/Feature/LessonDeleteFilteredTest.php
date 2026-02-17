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

class LessonDeleteFilteredTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_delete_filtered_by_date_range(): void
    {
        Lesson::factory()->create(['datetime' => '2025-03-01 10:00']);
        Lesson::factory()->create(['datetime' => '2025-03-15 10:00']);
        $outside = Lesson::factory()->create(['datetime' => '2025-04-01 10:00']);

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
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);
        Lesson::factory()->create(['datetime' => '2025-03-01 10:00', 'buyer_id' => 'acme']);
        Lesson::factory()->create(['datetime' => '2025-03-02 10:00', 'buyer_id' => 'acme']);
        $kept = Lesson::factory()->create(['datetime' => '2025-03-03 10:00']);

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
        $alice = Student::factory()->create(['name' => 'Alice']);
        $bob = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['datetime' => '2025-03-01 10:00', 'student_id' => $alice->id]);
        $kept = Lesson::factory()->create(['datetime' => '2025-03-02 10:00', 'student_id' => $bob->id]);

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
        $clientA = Client::factory()->create(['name' => 'ClientA']);
        $clientB = Client::factory()->create(['name' => 'ClientB']);
        Lesson::factory()->create(['datetime' => '2025-03-01 10:00', 'client_id' => $clientA->id]);
        Lesson::factory()->create(['datetime' => '2025-03-02 10:00', 'client_id' => $clientA->id]);
        $kept = Lesson::factory()->create(['datetime' => '2025-03-03 10:00', 'client_id' => $clientB->id]);

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
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);
        $alice = Student::factory()->create(['name' => 'Alice']);
        $bob = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['datetime' => '2025-03-01 10:00', 'buyer_id' => 'acme', 'student_id' => $alice->id]);
        $kept1 = Lesson::factory()->create(['datetime' => '2025-03-02 10:00', 'buyer_id' => 'acme', 'student_id' => $bob->id]);
        $kept2 = Lesson::factory()->create(['datetime' => '2025-03-03 10:00', 'student_id' => $alice->id]);

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
        Lesson::factory()->create(['datetime' => '2025-03-01 10:00']);
        Lesson::factory()->create(['datetime' => '2025-03-15 10:00']);
        Lesson::factory()->create(['datetime' => '2025-03-31 10:00']);

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
