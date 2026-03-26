<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\ExchangeRate;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvoiceCsvTest extends TestCase
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

    public function test_invoice_csv_requires_authentication(): void
    {
        $this->get(route('portal.invoices.csv', '2025-001'))
            ->assertRedirect(route('login'));
    }

    public function test_invoice_csv_returns_404_for_invalid_format(): void
    {
        $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', 'invalid'))
            ->assertStatus(404);
    }

    public function test_invoice_csv_returns_404_for_nonexistent_invoice(): void
    {
        $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-999'))
            ->assertStatus(404);
    }

    public function test_invoice_csv_returns_404_when_no_buyer(): void
    {
        Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'sequence_number' => '001',
        ]);

        $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-001'))
            ->assertStatus(404);
    }

    public function test_invoice_csv_returns_csv_with_no_lessons(): void
    {
        Buyer::factory()->create([
            'id' => 'acme',
            'name' => 'Acme Corp',
        ]);

        Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'currency' => 'GBP',
            'payment_reference' => 'REF-123',
            'buyer_id' => 'acme',
            'sequence_number' => '001',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-001'));

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader('content-disposition', 'attachment; filename="invoice-2025-001.csv"');

        $lines = array_filter(explode("\n", $response->getContent()));
        $this->assertCount(2, $lines); // header + 1 data row

        $header = str_getcsv(array_values($lines)[0]);
        $this->assertContains('External ID', $header);
        $this->assertContains('Number', $header);
        $this->assertContains('Partner', $header);
        $this->assertContains('Invoice Bill Date', $header);
        $this->assertContains('Currency', $header);
        $this->assertContains('Invoice Lines/Label', $header);
        $this->assertContains('Invoice Lines/Quantity', $header);
        $this->assertContains('Invoice Lines/Unit Price', $header);

        $row = str_getcsv(array_values($lines)[1]);
        $indexed = array_combine($header, $row);
        $this->assertSame('invoice_2025_001', $indexed['External ID']);
        $this->assertSame('2025-001', $indexed['Number']);
        $this->assertSame('Acme Corp', $indexed['Partner']);
        $this->assertSame('2025-01-10', $indexed['Invoice Bill Date']);
        $this->assertSame('GBP', $indexed['Currency']);
        $this->assertSame('Sales', $indexed['Journal']);
        $this->assertSame('REF-123', $indexed['Payment Reference']);
        $this->assertSame('1.18000', $indexed['Currency Rate']);
        $this->assertSame('705200', $indexed['Invoice Lines/Account']); // null country → export
        $this->assertSame('Clases online de informática', $indexed['Invoice Lines/Label']);
        $this->assertSame('1', $indexed['Invoice Lines/Quantity']);
        $this->assertSame('50.00', $indexed['Invoice Lines/Unit Price']);
    }

    public function test_invoice_csv_uses_705000_for_spain(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'country' => 'ES']);
        Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'buyer_id' => 'acme',
            'sequence_number' => '001',
        ]);

        $lines = array_filter(explode("\n", $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-001'))
            ->getContent()));
        $header = str_getcsv(array_values($lines)[0]);
        $row = array_combine($header, str_getcsv(array_values($lines)[1]));

        $this->assertSame('705000', $row['Invoice Lines/Account']);
    }

    public function test_invoice_csv_uses_705100_for_eu_country(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'country' => 'FR']);
        Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'buyer_id' => 'acme',
            'sequence_number' => '001',
        ]);

        $lines = array_filter(explode("\n", $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-001'))
            ->getContent()));
        $header = str_getcsv(array_values($lines)[0]);
        $row = array_combine($header, str_getcsv(array_values($lines)[1]));

        $this->assertSame('705100', $row['Invoice Lines/Account']);
    }

    public function test_invoice_csv_uses_705200_for_non_eu_country(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'country' => 'GB']);
        Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'buyer_id' => 'acme',
            'sequence_number' => '001',
        ]);

        $lines = array_filter(explode("\n", $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-001'))
            ->getContent()));
        $header = str_getcsv(array_values($lines)[0]);
        $row = array_combine($header, str_getcsv(array_values($lines)[1]));

        $this->assertSame('705200', $row['Invoice Lines/Account']);
    }

    public function test_invoice_csv_handles_empty_payment_reference(): void
    {
        Buyer::factory()->create([
            'id' => 'acme',
            'name' => 'Acme Corp',
        ]);

        Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 5000,
            'currency' => 'GBP',
            'payment_reference' => '',
            'buyer_id' => 'acme',
            'sequence_number' => '001',
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-001'));

        $response->assertStatus(200);

        $lines = array_filter(explode("\n", $response->getContent()));
        $header = str_getcsv(array_values($lines)[0]);
        $row = array_combine($header, str_getcsv(array_values($lines)[1]));

        $this->assertSame('', $row['Payment Reference']);
        $this->assertSame('', $row['Reference']);
    }

    public function test_invoice_csv_returns_one_row_per_lesson(): void
    {
        Buyer::factory()->create([
            'id' => 'acme',
            'name' => 'Acme Corp',
        ]);

        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 10000,
            'currency' => 'GBP',
            'buyer_id' => 'acme',
            'sequence_number' => '001',
        ]);

        $lesson1 = Lesson::factory()->create([
            'datetime' => '2025-01-08 10:00',
            'price_gbp_pence' => 5000,
            'description' => 'Online computer science classes',
        ]);
        $lesson2 = Lesson::factory()->create([
            'datetime' => '2025-01-09 10:00',
            'price_gbp_pence' => 5000,
            'description' => 'Online computer science classes',
        ]);
        $payment->lessons()->attach([$lesson1->id, $lesson2->id]);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-001'));

        $response->assertStatus(200);

        $lines = array_filter(explode("\n", $response->getContent()));
        $this->assertCount(3, $lines); // header + 2 lesson rows

        $header = str_getcsv(array_values($lines)[0]);
        $row1 = array_combine($header, str_getcsv(array_values($lines)[1]));
        $row2 = array_combine($header, str_getcsv(array_values($lines)[2]));

        $this->assertSame('Clases online de informática', $row1['Invoice Lines/Label']);
        $this->assertSame('50.00', $row1['Invoice Lines/Unit Price']);
        $this->assertSame('Clases online de informática', $row2['Invoice Lines/Label']);
        $this->assertSame('50.00', $row2['Invoice Lines/Unit Price']);
    }

    public function test_invoice_csv_adds_extra_row_for_remaining_amount(): void
    {
        Buyer::factory()->create([
            'id' => 'acme',
            'name' => 'Acme Corp',
        ]);

        $payment = Payment::factory()->create([
            'id' => 'PAY-1',
            'datetime' => '2025-01-10 10:00',
            'amount_gbp_pence' => 7500,
            'currency' => 'GBP',
            'buyer_id' => 'acme',
            'sequence_number' => '001',
        ]);

        $lesson = Lesson::factory()->create([
            'datetime' => '2025-01-08 10:00',
            'price_gbp_pence' => 5000,
            'description' => 'Online computer science classes',
        ]);
        $payment->lessons()->attach($lesson->id);

        $response = $this->actingAs($this->user)
            ->get(route('portal.invoices.csv', '2025-001'));

        $response->assertStatus(200);

        $lines = array_filter(explode("\n", $response->getContent()));
        $this->assertCount(3, $lines); // header + lesson row + remaining row

        $header = str_getcsv(array_values($lines)[0]);
        $row2 = array_combine($header, str_getcsv(array_values($lines)[2]));
        $this->assertSame('Clases online de informática', $row2['Invoice Lines/Label']);
        $this->assertSame('25.00', $row2['Invoice Lines/Unit Price']);
    }
}
