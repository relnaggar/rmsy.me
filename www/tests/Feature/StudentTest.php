<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentTest extends TestCase
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
        $this->get(route('portal.students.index'))
            ->assertRedirect(route('login'));
    }

    public function test_index_renders_with_no_students(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.students.index'));

        $response->assertStatus(200);
    }

    public function test_index_lists_students(): void
    {
        Student::factory()->create(['name' => 'Alice']);
        Student::factory()->create(['name' => 'Bob']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.students.index'));

        $response->assertStatus(200);
        $response->assertSee('Alice');
        $response->assertSee('Bob');
    }

    public function test_show_requires_authentication(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);

        $this->get(route('portal.students.show', $student))
            ->assertRedirect(route('login'));
    }

    public function test_show_renders_student_detail(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.students.show', $student));

        $response->assertStatus(200);
        $response->assertSee('Alice');
    }

    public function test_show_displays_student_lessons(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'student_id' => $student->id,
            'buyer_id' => 'acme',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.students.show', $student));

        $response->assertStatus(200);
        $response->assertSee('Acme');
    }

    public function test_update_requires_authentication(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);

        $this->put(route('portal.students.update', $student), ['name' => 'Bob'])
            ->assertRedirect(route('login'));
    }

    public function test_update_changes_student_name(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.students.update', $student), ['name' => 'Alice Smith']);

        $response->assertRedirect(route('portal.students.show', $student));
        $response->assertSessionHas('success');
        $this->assertEquals('Alice Smith', $student->fresh()->name);
    }

    public function test_update_validates_name_required(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.students.update', $student), ['name' => '']);

        $response->assertSessionHasErrors('name');
    }

    public function test_update_validates_name_max_length(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.students.update', $student), ['name' => str_repeat('a', 256)]);

        $response->assertSessionHasErrors('name');
    }

    public function test_destroy_requires_authentication(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);

        $this->delete(route('portal.students.destroy', $student))
            ->assertRedirect(route('login'));
    }

    public function test_destroy_deletes_student(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);

        $response = $this->actingAs($this->user)
            ->delete(route('portal.students.destroy', $student));

        $response->assertRedirect(route('portal.students.index'));
        $response->assertSessionHas('success');
        $this->assertNull(Student::find($student->id));
    }
}
