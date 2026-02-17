<?php

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\ExchangeRate;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_invoices_index_requires_authentication(): void
    {
        $response = $this->get(route('portal.invoices.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_invoices_index_shows_empty_state(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.index'));

        $response->assertStatus(200);
        $response->assertSee('No invoices found.');
    }

    public function test_invoices_index_lists_invoices_with_amounts(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        ExchangeRate::factory()->create(['date' => '2025-01-10', 'gbpeur' => 0.84000]);
        Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 10000,
            'sequence_number' => '001',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.index'));

        $response->assertStatus(200);
        $response->assertSee('2025-001');
        $response->assertSee('2025-01-10');
        $response->assertSee('100.00');
        $response->assertSee('Acme');
        // EUR = ceil(10000 / (84000 / 100000)) = ceil(10000 / 0.84) = ceil(11904.76...) = 11905 cents = 119.05
        $response->assertSee('119.05');
        $response->assertSee('0.84');
    }

    public function test_invoices_index_excludes_payments_without_sequence_number(): void
    {
        ExchangeRate::factory()->create(['date' => '2025-01-10', 'gbpeur' => 0.84000]);
        Payment::factory()->create([
            'id' => 'PAY-NO-SEQ',
            'datetime' => '2025-01-10 10:00',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.index'));

        $response->assertStatus(200);
        $response->assertSee('No invoices found.');
        $response->assertDontSee('PAY-NO-SEQ');
    }

    public function test_invoices_index_shows_trimestre_grouping(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        ExchangeRate::factory()->create(['date' => '2025-01-15', 'gbpeur' => 0.84000]);
        ExchangeRate::factory()->create(['date' => '2025-04-15', 'gbpeur' => 0.86000]);

        Payment::factory()->create([
            'id' => 'PAY-T1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-15 10:00',
            'amount_gbp_pence' => 5000,
            'sequence_number' => '001',
        ]);
        Payment::factory()->create([
            'id' => 'PAY-T2',
            'buyer_id' => 'acme',
            'datetime' => '2025-04-15 10:00',
            'amount_gbp_pence' => 6000,
            'sequence_number' => '002',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.index'));

        $response->assertStatus(200);
        $response->assertSee('2025');
        $response->assertSee('T1');
        $response->assertSee('T2');
    }

    public function test_invoices_index_groups_by_year(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        ExchangeRate::factory()->create(['date' => '2024-06-15', 'gbpeur' => 0.84000]);
        ExchangeRate::factory()->create(['date' => '2025-03-10', 'gbpeur' => 0.86000]);

        Payment::factory()->create([
            'id' => 'PAY-2024',
            'buyer_id' => 'acme',
            'datetime' => '2024-06-15 10:00',
            'amount_gbp_pence' => 5000,
            'sequence_number' => '001',
        ]);
        Payment::factory()->create([
            'id' => 'PAY-2025',
            'buyer_id' => 'acme',
            'datetime' => '2025-03-10 10:00',
            'amount_gbp_pence' => 6000,
            'sequence_number' => '001',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.index'));

        $response->assertStatus(200);
        $response->assertSee('2025');
        $response->assertSee('2024');
    }

    public function test_invoices_index_uses_nearest_prior_exchange_rate(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        // Rate on Friday, payment on Saturday — should use Friday's rate
        ExchangeRate::factory()->create(['date' => '2025-01-10', 'gbpeur' => 0.84000]);
        Payment::factory()->create([
            'id' => 'PAY-SAT',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-11 10:00',
            'amount_gbp_pence' => 10000,
            'sequence_number' => '001',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.index'));

        $response->assertStatus(200);
        // Should use Friday's rate 0.84, same as exact match test
        $response->assertSee('119.05');
        $response->assertSee('0.84');
    }

    public function test_invoices_index_year_totals_match_sum_of_invoices(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        ExchangeRate::factory()->create(['date' => '2025-01-10', 'gbpeur' => 0.84000]);
        ExchangeRate::factory()->create(['date' => '2025-01-20', 'gbpeur' => 0.85000]);

        Payment::factory()->create([
            'id' => 'PAY-1',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'sequence_number' => '001',
        ]);
        Payment::factory()->create([
            'id' => 'PAY-2',
            'buyer_id' => 'acme',
            'datetime' => '2025-01-20 10:00',
            'amount_gbp_pence' => 7000,
            'sequence_number' => '002',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.index'));

        $response->assertStatus(200);

        // GBP total: 5000 + 7000 = 12000 pence = 120.00
        $response->assertSee('120.00');

        // Individual EUR: ceil(5000/0.84) = 5953 cents = 59.53
        $response->assertSee('59.53');
        // Individual EUR: ceil(7000/0.85) = 8236 cents = 82.36
        $response->assertSee('82.36');
        // EUR total: 5953 + 8236 = 14189 cents = 141.89
        $response->assertSee('141.89');
    }
}
