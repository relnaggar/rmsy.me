<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientTest extends TestCase
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
        $this->get(route('portal.clients.index'))
            ->assertRedirect(route('login'));
    }

    public function test_index_renders_with_no_clients(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.clients.index'));

        $response->assertStatus(200);
    }

    public function test_index_lists_clients(): void
    {
        Client::factory()->create(['name' => 'School A']);
        Client::factory()->create(['name' => 'School B']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.clients.index'));

        $response->assertStatus(200);
        $response->assertSee('School A');
        $response->assertSee('School B');
    }

    public function test_show_requires_authentication(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);

        $this->get(route('portal.clients.show', $client))
            ->assertRedirect(route('login'));
    }

    public function test_show_renders_client_detail(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.clients.show', $client));

        $response->assertStatus(200);
        $response->assertSee('School A');
    }

    public function test_show_displays_client_lessons(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);
        $student = Student::factory()->create(['name' => 'Alice']);
        Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'client_id' => $client->id,
            'student_id' => $student->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.clients.show', $client));

        $response->assertStatus(200);
        $response->assertSee('Alice');
    }

    public function test_update_requires_authentication(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);

        $this->put(route('portal.clients.update', $client), ['name' => 'School B'])
            ->assertRedirect(route('login'));
    }

    public function test_update_changes_client_name(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.clients.update', $client), ['name' => 'School A Updated']);

        $response->assertRedirect(route('portal.clients.show', $client));
        $response->assertSessionHas('success');
        $this->assertEquals('School A Updated', $client->fresh()->name);
    }

    public function test_update_validates_name_required(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.clients.update', $client), ['name' => '']);

        $response->assertSessionHasErrors('name');
    }

    public function test_update_validates_name_max_length(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.clients.update', $client), ['name' => str_repeat('a', 256)]);

        $response->assertSessionHasErrors('name');
    }

    public function test_destroy_requires_authentication(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);

        $this->delete(route('portal.clients.destroy', $client))
            ->assertRedirect(route('login'));
    }

    public function test_destroy_deletes_client(): void
    {
        $client = Client::factory()->create(['name' => 'School A']);

        $response = $this->actingAs($this->user)
            ->delete(route('portal.clients.destroy', $client));

        $response->assertRedirect(route('portal.clients.index'));
        $response->assertSessionHas('success');
        $this->assertNull(Client::find($client->id));
    }
}
