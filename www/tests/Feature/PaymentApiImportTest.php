<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Models\WiseDeposit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class PaymentApiImportTest extends TestCase
{
    use RefreshDatabase;

    private string $validCsv;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->validCsv = "id,type,datetime,amount,currency,description,reference,running_balance,exchange_from,exchange_to,exchange_rate,payer_name,payee_name,payment_reference\n";
        $this->validCsv .= "TRANSFER-123,CREDIT,2026-02-17 10:30:00,50.00,GBP,Payment,,1000.00,,,,John Doe,,ref\n";
    }

    public function test_form_import_redirects_with_success_message(): void
    {
        $file = UploadedFile::fake()->createWithContent('statement.csv', $this->validCsv);

        $response = $this->actingAs($this->user)
            ->post(route('portal.payments.import'), ['csv_file' => $file]);

        $response->assertRedirect(route('portal.payments.index'));
        $response->assertSessionHas('success', 'Imported 1 payments. Skipped 0 duplicates.');
        $this->assertDatabaseHas('payments', ['id' => 'TRANSFER-123', 'payer' => 'John Doe']);
    }

    public function test_api_import_succeeds_with_valid_token(): void
    {
        config(['services.api_token' => 'test-token']);

        $file = UploadedFile::fake()->createWithContent('statement.csv', $this->validCsv);

        $response = $this->postJson(
            route('api.payments.import'),
            ['csv_file' => $file],
            ['Authorization' => 'Bearer test-token']
        );

        $response->assertStatus(200);
        $response->assertJson(['imported' => 1, 'skipped' => 0]);
        $this->assertDatabaseHas('payments', ['id' => 'TRANSFER-123']);
        $this->assertDatabaseHas('buyers', ['id' => 'John Doe']);
    }

    public function test_api_import_returns_401_without_token(): void
    {
        config(['services.api_token' => 'test-token']);

        $file = UploadedFile::fake()->createWithContent('statement.csv', $this->validCsv);

        $response = $this->postJson(
            route('api.payments.import'),
            ['csv_file' => $file]
        );

        $response->assertStatus(401);
        $response->assertJson(['error' => 'Unauthorized.']);
    }

    public function test_api_import_returns_401_with_wrong_token(): void
    {
        config(['services.api_token' => 'test-token']);

        $file = UploadedFile::fake()->createWithContent('statement.csv', $this->validCsv);

        $response = $this->postJson(
            route('api.payments.import'),
            ['csv_file' => $file],
            ['Authorization' => 'Bearer wrong-token']
        );

        $response->assertStatus(401);
        $response->assertJson(['error' => 'Unauthorized.']);
    }

    public function test_api_import_returns_422_without_file(): void
    {
        config(['services.api_token' => 'test-token']);

        $response = $this->postJson(
            route('api.payments.import'),
            [],
            ['Authorization' => 'Bearer test-token']
        );

        $response->assertStatus(422);
    }

    public function test_api_import_skips_duplicates(): void
    {
        config(['services.api_token' => 'test-token']);

        // Import once
        $file = UploadedFile::fake()->createWithContent('statement.csv', $this->validCsv);
        $this->postJson(
            route('api.payments.import'),
            ['csv_file' => $file],
            ['Authorization' => 'Bearer test-token']
        );

        // Import again
        $file = UploadedFile::fake()->createWithContent('statement.csv', $this->validCsv);
        $response = $this->postJson(
            route('api.payments.import'),
            ['csv_file' => $file],
            ['Authorization' => 'Bearer test-token']
        );

        $response->assertStatus(200);
        $response->assertJson(['imported' => 0, 'skipped' => 1]);
        $this->assertDatabaseCount('payments', 1);
    }

    public function test_api_import_clears_matching_wise_deposit(): void
    {
        config(['services.api_token' => 'test-token']);

        WiseDeposit::factory()->create([
            'amount_cents' => 5000,
            'currency' => 'GBP',
            'occurred_at' => '2026-02-17T10:00:00Z',
        ]);

        $file = UploadedFile::fake()->createWithContent('statement.csv', $this->validCsv);

        $response = $this->postJson(
            route('api.payments.import'),
            ['csv_file' => $file],
            ['Authorization' => 'Bearer test-token']
        );

        $response->assertStatus(200);
        $this->assertDatabaseCount('wise_deposits', 0);
    }
}
