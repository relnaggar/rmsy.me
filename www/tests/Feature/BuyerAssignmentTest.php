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

    private function createBuyer(string $id, string $name): Buyer
    {
        return Buyer::create(['id' => $id, 'name' => $name]);
    }

    private function createLesson(array $attributes): Lesson
    {
        return Lesson::create(array_merge([
            'datetime' => now(),
            'price_gbp_pence' => 5000,
        ], $attributes));
    }

    private function createPayment(string $id, array $attributes): Payment
    {
        return Payment::create(array_merge([
            'id' => $id,
            'datetime' => now(),
            'amount_gbp_pence' => 5000,
            'currency' => 'GBP',
            'payment_reference' => 'ref',
        ], $attributes));
    }

    public function test_reassign_moves_lessons_between_buyers(): void
    {
        $from = $this->createBuyer('from-co', 'From Co');
        $to = $this->createBuyer('to-co', 'To Co');
        $this->createLesson(['buyer_id' => 'from-co', 'datetime' => '2025-01-01 10:00']);
        $this->createLesson(['buyer_id' => 'from-co', 'datetime' => '2025-01-02 10:00']);
        $this->createLesson(['buyer_id' => 'to-co', 'datetime' => '2025-01-03 10:00']);

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
        $this->createBuyer('same-co', 'Same Co');

        $response = $this->actingAs($this->user)->post(route('portal.buyers.reassign'), [
            'from_buyer_id' => 'same-co',
            'to_buyer_id' => 'same-co',
        ]);

        $response->assertSessionHasErrors('to_buyer_id');
    }

    public function test_assign_by_student(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme Corp');
        $student = Student::create(['name' => 'Alice']);
        $otherStudent = Student::create(['name' => 'Bob']);
        $this->createLesson(['student_id' => $student->id, 'datetime' => '2025-01-01 10:00']);
        $this->createLesson(['student_id' => $student->id, 'datetime' => '2025-01-02 10:00']);
        $this->createLesson(['student_id' => $otherStudent->id, 'datetime' => '2025-01-03 10:00']);

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
        $buyer = $this->createBuyer('acme', 'Acme Corp');
        $client = Client::create(['name' => 'ClientA']);
        $otherClient = Client::create(['name' => 'ClientB']);
        $this->createLesson(['client_id' => $client->id, 'datetime' => '2025-01-01 10:00']);
        $this->createLesson(['client_id' => $otherClient->id, 'datetime' => '2025-01-02 10:00']);

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
        $this->createBuyer('acme', 'Acme Corp');

        $response = $this->actingAs($this->user)->post(route('portal.buyers.assign'), [
            'filter_type' => 'invalid',
            'filter_id' => 1,
            'buyer_id' => 'acme',
        ]);

        $response->assertSessionHasErrors('filter_type');
    }

    public function test_assign_payments_by_payer(): void
    {
        $buyer = $this->createBuyer('acme', 'Acme Corp');
        $this->createPayment('PAY-1', ['payer' => 'John Smith']);
        $this->createPayment('PAY-2', ['payer' => 'John Smith']);
        $this->createPayment('PAY-3', ['payer' => 'Jane Doe']);

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
        $buyer = $this->createBuyer('John / Jane', 'John / Jane');

        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.edit', $buyer));

        $response->assertStatus(200);
        $response->assertSee('John / Jane');
    }

    public function test_update_buyer_with_slash_in_id(): void
    {
        $buyer = $this->createBuyer('John / Jane', 'John / Jane');

        $response = $this->actingAs($this->user)
            ->put(route('portal.buyers.update', $buyer), [
                'name' => 'John and Jane',
                'country' => 'GB',
            ]);

        $response->assertRedirect(route('portal.buyers.index'));
        $this->assertEquals('John and Jane', $buyer->fresh()->name);
    }

    public function test_delete_buyer_with_slash_in_id(): void
    {
        $buyer = $this->createBuyer('John / Jane', 'John / Jane');

        $response = $this->actingAs($this->user)
            ->delete(route('portal.buyers.destroy', $buyer));

        $response->assertRedirect(route('portal.buyers.index'));
        $this->assertNull(Buyer::find('John / Jane'));
    }

    public function test_index_renders_edit_link_for_buyer_with_slash_in_id(): void
    {
        $buyer = $this->createBuyer('John / Jane', 'John / Jane');

        $response = $this->actingAs($this->user)
            ->get(route('portal.buyers.index'));

        $response->assertStatus(200);

        $editUrl = route('portal.buyers.edit', $buyer);
        $response->assertSee($editUrl, false);
    }

    public function test_index_edit_link_for_buyer_with_slash_reaches_correct_buyer(): void
    {
        $buyer = $this->createBuyer('John / Jane', 'John / Jane');

        // Get the index page and extract the edit URL
        $indexResponse = $this->actingAs($this->user)
            ->get(route('portal.buyers.index'));

        $editUrl = route('portal.buyers.edit', $buyer);

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
