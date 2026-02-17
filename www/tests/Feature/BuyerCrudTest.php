<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyerCrudTest extends TestCase
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
        $this->get(route('portal.buyers.index'))
            ->assertRedirect(route('login'));
    }

    public function test_index_renders_with_no_buyers(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.index'));

        $response->assertStatus(200);
    }

    public function test_index_lists_buyers(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);
        Buyer::factory()->create(['id' => 'globex', 'name' => 'Globex Inc']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.index'));

        $response->assertStatus(200);
        $response->assertSee('Acme Corp');
        $response->assertSee('Globex Inc');
    }

    public function test_create_requires_authentication(): void
    {
        $this->get(route('portal.buyers.create'))
            ->assertRedirect(route('login'));
    }

    public function test_create_renders_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.create'));

        $response->assertStatus(200);
    }

    public function test_store_requires_authentication(): void
    {
        $this->post(route('portal.buyers.store'), [
            'id' => 'acme',
            'name' => 'Acme Corp',
            'country' => 'GB',
        ])->assertRedirect(route('login'));
    }

    public function test_store_creates_buyer(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.buyers.store'), [
                'id' => 'acme',
                'name' => 'Acme Corp',
                'address1' => '123 Main St',
                'town_city' => 'London',
                'country' => 'GB',
            ]);

        $response->assertRedirect(route('portal.buyers.index'));
        $response->assertSessionHas('success');

        $buyer = Buyer::find('acme');
        $this->assertNotNull($buyer);
        $this->assertEquals('Acme Corp', $buyer->name);
        $this->assertEquals('123 Main St', $buyer->address1);
        $this->assertEquals('London', $buyer->town_city);
        $this->assertEquals('GB', $buyer->country);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.buyers.store'), []);

        $response->assertSessionHasErrors(['id', 'name', 'country']);
    }

    public function test_store_validates_unique_id(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);

        $response = $this->actingAs($this->user)
            ->post(route('portal.buyers.store'), [
                'id' => 'acme',
                'name' => 'Another Acme',
                'country' => 'GB',
            ]);

        $response->assertSessionHasErrors('id');
    }

    public function test_store_validates_country_size(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('portal.buyers.store'), [
                'id' => 'acme',
                'name' => 'Acme Corp',
                'country' => 'GBR',
            ]);

        $response->assertSessionHasErrors('country');
    }

    public function test_show_requires_authentication(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);

        $this->get(route('portal.buyers.show', $buyer))
            ->assertRedirect(route('login'));
    }

    public function test_show_renders_buyer_detail(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp', 'country' => 'GB']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.show', $buyer));

        $response->assertStatus(200);
        $response->assertSee('Acme Corp');
    }

    public function test_show_displays_buyer_lessons(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);
        Lesson::factory()->create([
            'datetime' => '2025-01-10 10:00',
            'price_gbp_pence' => 3000,
            'buyer_id' => 'acme',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.show', $buyer));

        $response->assertStatus(200);
    }

    public function test_update_requires_authentication(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);

        $this->put(route('portal.buyers.update', $buyer), ['name' => 'New Name', 'country' => 'GB'])
            ->assertRedirect(route('login'));
    }

    public function test_update_changes_buyer_fields(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp', 'country' => 'GB']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.buyers.update', $buyer), [
                'name' => 'Acme Corporation',
                'address1' => '456 New St',
                'country' => 'US',
            ]);

        $response->assertRedirect(route('portal.buyers.show', $buyer));
        $response->assertSessionHas('success');

        $buyer->refresh();
        $this->assertEquals('Acme Corporation', $buyer->name);
        $this->assertEquals('456 New St', $buyer->address1);
        $this->assertEquals('US', $buyer->country);
    }

    public function test_destroy_requires_authentication(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);

        $this->delete(route('portal.buyers.destroy', $buyer))
            ->assertRedirect(route('login'));
    }

    public function test_destroy_deletes_buyer(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);

        $response = $this->actingAs($this->user)
            ->delete(route('portal.buyers.destroy', Buyer::find('acme')));

        $response->assertRedirect(route('portal.buyers.index'));
        $response->assertSessionHas('success');
        $this->assertNull(Buyer::find('acme'));
    }
}
