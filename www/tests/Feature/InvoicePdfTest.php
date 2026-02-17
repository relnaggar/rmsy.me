<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\ExchangeRate;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoicePdfTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();

        ExchangeRate::factory()->create([
            'date' => '2025-01-09',
            'gbpeur' => 1.18000,
        ]);
    }

    public function test_invoice_show_requires_authentication(): void
    {
        $this->get(route('portal.invoices.show', '2025-001'))
            ->assertRedirect(route('login'));
    }

    public function test_invoice_show_returns_pdf(): void
    {
        Buyer::factory()->create([
            'id' => 'acme',
            'name' => 'Acme Corp',
            'address1' => '123 Main St',
            'town_city' => 'London',
            'country' => 'GB',
        ]);

        Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'buyer_id' => 'acme',
            'sequence_number' => '001',
        ]);

        config(['services.seller_address' => 'Name|Address1|Address2|Town|12345|ES']);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.show', '2025-001'));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    public function test_invoice_show_returns_404_for_invalid_format(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.show', 'invalid'));

        $response->assertStatus(404);
    }

    public function test_invoice_show_returns_404_for_nonexistent_invoice(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.show', '2025-999'));

        $response->assertStatus(404);
    }

    public function test_invoice_show_returns_404_when_no_buyer(): void
    {
        Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'sequence_number' => '001',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.show', '2025-001'));

        $response->assertStatus(404);
    }
}
