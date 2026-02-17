<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyerAssignmentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_reassign_moves_lessons_between_buyers(): void
    {
        Buyer::factory()->create(['id' => 'from-co', 'name' => 'From Co']);
        Buyer::factory()->create(['id' => 'to-co', 'name' => 'To Co']);
        Lesson::factory()->create(['buyer_id' => 'from-co', 'datetime' => '2025-01-01 10:00']);
        Lesson::factory()->create(['buyer_id' => 'from-co', 'datetime' => '2025-01-02 10:00']);
        Lesson::factory()->create(['buyer_id' => 'to-co', 'datetime' => '2025-01-03 10:00']);

        $response = $this->actingAs($this->user)->post(route('portal.buyers.reassign'), [
            'from_buyer_id' => 'from-co',
            'to_buyer_id' => 'to-co',
        ]);

        $response->assertRedirect(route('portal.buyers.index'));
        $response->assertSessionHas('success');
        $this->assertEquals(0, Lesson::where('buyer_id', 'from-co')->count());
        $this->assertEquals(3, Lesson::where('buyer_id', 'to-co')->count());
    }

    public function test_reassign_requires_different_buyers(): void
    {
        Buyer::factory()->create(['id' => 'same-co', 'name' => 'Same Co']);

        $response = $this->actingAs($this->user)->post(route('portal.buyers.reassign'), [
            'from_buyer_id' => 'same-co',
            'to_buyer_id' => 'same-co',
        ]);

        $response->assertSessionHasErrors('to_buyer_id');
    }

    public function test_assign_by_student(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);
        $student = Student::factory()->create(['name' => 'Alice']);
        $otherStudent = Student::factory()->create(['name' => 'Bob']);
        Lesson::factory()->create(['student_id' => $student->id, 'datetime' => '2025-01-01 10:00']);
        Lesson::factory()->create(['student_id' => $student->id, 'datetime' => '2025-01-02 10:00']);
        Lesson::factory()->create(['student_id' => $otherStudent->id, 'datetime' => '2025-01-03 10:00']);

        $response = $this->actingAs($this->user)->post(route('portal.buyers.assign'), [
            'filter_type' => 'student',
            'filter_id' => $student->id,
            'buyer_id' => 'acme',
        ]);

        $response->assertRedirect(route('portal.buyers.index'));
        $response->assertSessionHas('success');
        $this->assertEquals(2, Lesson::where('buyer_id', 'acme')->where('student_id', $student->id)->count());
        $this->assertNull(Lesson::where('student_id', $otherStudent->id)->first()->buyer_id);
    }

    public function test_assign_by_client(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);
        $client = Client::factory()->create(['name' => 'ClientA']);
        $otherClient = Client::factory()->create(['name' => 'ClientB']);
        Lesson::factory()->create(['client_id' => $client->id, 'datetime' => '2025-01-01 10:00']);
        Lesson::factory()->create(['client_id' => $otherClient->id, 'datetime' => '2025-01-02 10:00']);

        $response = $this->actingAs($this->user)->post(route('portal.buyers.assign'), [
            'filter_type' => 'client',
            'filter_id' => $client->id,
            'buyer_id' => 'acme',
        ]);

        $response->assertRedirect(route('portal.buyers.index'));
        $this->assertEquals('acme', Lesson::where('client_id', $client->id)->first()->buyer_id);
        $this->assertNull(Lesson::where('client_id', $otherClient->id)->first()->buyer_id);
    }

    public function test_assign_rejects_invalid_filter_type(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);

        $response = $this->actingAs($this->user)->post(route('portal.buyers.assign'), [
            'filter_type' => 'invalid',
            'filter_id' => 1,
            'buyer_id' => 'acme',
        ]);

        $response->assertSessionHasErrors('filter_type');
    }

    public function test_assign_payments_by_payer(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme Corp']);
        Payment::factory()->create(['id' => 'PAY-1', 'payer' => 'John Smith']);
        Payment::factory()->create(['id' => 'PAY-2', 'payer' => 'John Smith']);
        Payment::factory()->create(['id' => 'PAY-3', 'payer' => 'Jane Doe']);

        $response = $this->actingAs($this->user)->post(route('portal.buyers.assignPayments'), [
            'payer' => 'John Smith',
            'buyer_id' => 'acme',
        ]);

        $response->assertRedirect(route('portal.buyers.index'));
        $response->assertSessionHas('success');
        $this->assertEquals(2, Payment::where('buyer_id', 'acme')->where('payer', 'John Smith')->count());
        $this->assertNull(Payment::where('payer', 'Jane Doe')->first()->buyer_id);
    }

    public function test_assign_payments_requires_valid_buyer(): void
    {
        $response = $this->actingAs($this->user)->post(route('portal.buyers.assignPayments'), [
            'payer' => 'John Smith',
            'buyer_id' => 'nonexistent',
        ]);

        $response->assertSessionHasErrors('buyer_id');
    }

    public function test_edit_buyer_with_slash_in_id(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'John / Jane', 'name' => 'John / Jane']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.show', $buyer));

        $response->assertStatus(200);
        $response->assertSee('John / Jane');
    }

    public function test_update_buyer_with_slash_in_id(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'John / Jane', 'name' => 'John / Jane']);

        $response = $this->actingAs($this->user)
            ->put(route('portal.buyers.update', $buyer), [
                'name' => 'John and Jane',
                'country' => 'GB',
            ]);

        $response->assertRedirect(route('portal.buyers.show', $buyer));
        $this->assertEquals('John and Jane', $buyer->fresh()->name);
    }

    public function test_delete_buyer_with_slash_in_id(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'John / Jane', 'name' => 'John / Jane']);

        $response = $this->actingAs($this->user)
            ->delete(route('portal.buyers.destroy', $buyer));

        $response->assertRedirect(route('portal.buyers.index'));
        $this->assertNull(Buyer::find('John / Jane'));
    }

    public function test_index_renders_edit_link_for_buyer_with_slash_in_id(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'John / Jane', 'name' => 'John / Jane']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.index'));

        $response->assertStatus(200);

        $editUrl = route('portal.buyers.show', $buyer);
        $response->assertSee($editUrl, false);
    }

    public function test_index_edit_link_for_buyer_with_slash_reaches_correct_buyer(): void
    {
        $buyer = Buyer::factory()->create(['id' => 'John / Jane', 'name' => 'John / Jane']);

        // Get the index page and extract the edit URL
        $indexResponse = $this->actingAs($this->user)
            ->get(route('portal.buyers.index'));

        $editUrl = route('portal.buyers.show', $buyer);

        // Follow the generated link
        $editResponse = $this->actingAs($this->user)
            ->get($editUrl);

        $editResponse->assertStatus(200);
        $editResponse->assertSee('John / Jane');
    }

    public function test_all_endpoints_require_authentication(): void
    {
        $this->post(route('portal.buyers.reassign'))->assertRedirect(route('login'));
        $this->post(route('portal.buyers.assign'))->assertRedirect(route('login'));
        $this->post(route('portal.buyers.assignPayments'))->assertRedirect(route('login'));
    }
}
