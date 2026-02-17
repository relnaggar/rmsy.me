<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\WiseDeposit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class WiseDepositTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_webhook_creates_wise_deposit(): void
    {
        $response = $this->postJson('/wise-deposit', [
            'data' => [
                'resource' => ['id' => 123, 'profile_id' => 456, 'type' => 'balance-account'],
                'amount' => 50.00,
                'currency' => 'GBP',
                'post_transaction_balance_amount' => 150.00,
                'occurred_at' => '2026-02-17T10:00:00Z',
                'transaction_type' => 'credit',
            ],
            'subscription_id' => 'sub-123',
            'event_type' => 'balances#credit',
            'schema_version' => '2.0.0',
            'sent_at' => '2026-02-17T10:00:00Z',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseCount('wise_deposits', 1);
        $this->assertDatabaseHas('wise_deposits', [
            'amount_cents' => 5000,
            'currency' => 'GBP',
        ]);
    }

    public function test_webhook_skips_test_notifications(): void
    {
        $response = $this->postJson('/wise-deposit', [
            'data' => [
                'resource' => ['id' => 0, 'profile_id' => 0, 'type' => 'balance-account'],
                'amount' => 0.01,
                'currency' => 'EUR',
                'post_transaction_balance_amount' => 0.01,
                'occurred_at' => '2026-02-17T12:00:00Z',
                'transaction_type' => 'credit',
            ],
            'subscription_id' => '00000000-0000-0000-0000-000000000000',
            'event_type' => 'balances#credit',
            'schema_version' => '2.0.0',
            'sent_at' => '2026-02-17T12:00:00Z',
        ], ['x-test-notification' => 'true']);

        $response->assertStatus(200);
        $this->assertDatabaseCount('wise_deposits', 0);
    }

    public function test_webhook_handles_empty_payload(): void
    {
        $response = $this->postJson('/wise-deposit', []);

        $response->assertStatus(200);
        $this->assertDatabaseCount('wise_deposits', 0);
    }

    public function test_dashboard_shows_deposit_alert(): void
    {
        WiseDeposit::create([
            'amount_cents' => 5000,
            'currency' => 'GBP',
            'occurred_at' => '2026-02-17T10:00:00Z',
        ]);
        WiseDeposit::create([
            'amount_cents' => 3000,
            'currency' => 'EUR',
            'occurred_at' => '2026-02-17T11:00:00Z',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertSee('2');
        $response->assertSee('new Wise deposits received');
    }

    public function test_dashboard_hides_deposit_alert_when_none(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('portal.dashboard'));

        $response->assertStatus(200);
        $response->assertDontSee('new Wise');
    }

    public function test_import_clears_matching_wise_deposit(): void
    {
        WiseDeposit::create([
            'amount_cents' => 5000,
            'currency' => 'GBP',
            'occurred_at' => '2026-02-17T10:00:00Z',
        ]);

        $csv = "id,type,datetime,amount,currency,description,reference,running_balance,exchange_from,exchange_to,exchange_rate,payer_name,payee_name,payment_reference\n";
        $csv .= "TRANSFER-123,CREDIT,2026-02-17 10:30:00,50.00,GBP,Payment,,1000.00,,,,John Doe,,ref\n";
        $file = UploadedFile::fake()->createWithContent('statement.csv', $csv);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.import'), ['csv_file' => $file]);

        $response->assertRedirect(route('portal.payments.index'));
        $this->assertDatabaseCount('wise_deposits', 0);
        $this->assertDatabaseHas('payments', ['id' => 'TRANSFER-123']);
    }

    public function test_import_leaves_non_matching_wise_deposit(): void
    {
        // Different amount — should not be cleared
        WiseDeposit::create([
            'amount_cents' => 9999,
            'currency' => 'GBP',
            'occurred_at' => '2026-02-17T10:00:00Z',
        ]);

        $csv = "id,type,datetime,amount,currency,description,reference,running_balance,exchange_from,exchange_to,exchange_rate,payer_name,payee_name,payment_reference\n";
        $csv .= "TRANSFER-123,CREDIT,2026-02-17 10:30:00,50.00,GBP,Payment,,1000.00,,,,John Doe,,ref\n";
        $file = UploadedFile::fake()->createWithContent('statement.csv', $csv);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.import'), ['csv_file' => $file]);

        $response->assertRedirect(route('portal.payments.index'));
        $this->assertDatabaseCount('wise_deposits', 1);
    }

    public function test_import_does_not_clear_deposit_outside_24h_window(): void
    {
        // Same amount and currency, but 2 days apart
        WiseDeposit::create([
            'amount_cents' => 5000,
            'currency' => 'GBP',
            'occurred_at' => '2026-02-15T10:00:00Z',
        ]);

        $csv = "id,type,datetime,amount,currency,description,reference,running_balance,exchange_from,exchange_to,exchange_rate,payer_name,payee_name,payment_reference\n";
        $csv .= "TRANSFER-123,CREDIT,2026-02-17 10:30:00,50.00,GBP,Payment,,1000.00,,,,John Doe,,ref\n";
        $file = UploadedFile::fake()->createWithContent('statement.csv', $csv);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.import'), ['csv_file' => $file]);

        $response->assertRedirect(route('portal.payments.index'));
        $this->assertDatabaseCount('wise_deposits', 1);
    }
}
