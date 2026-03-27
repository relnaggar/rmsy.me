<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\ExchangeRateService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\View\View;
use PrinsFrank\Standards\Country\CountryAlpha2;
use PrinsFrank\Standards\Country\Groups\EU;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class InvoiceController extends Controller
{
    public function __construct(
        private ExchangeRateService $exchangeRateService,
    ) {
    }

    public function index(): View
    {
        $payments = Payment::whereNotNull('sequence_number')
            ->with('buyer')
            ->orderByDesc('datetime')
            ->get();

        $invoices = $payments->map(function ($payment) {
            $exchangeRate = $this->exchangeRateService->getRateForDate($payment->getDate());

            return [
                'number' => $payment->getInvoiceNumber(),
                'issue_date' => $payment->getDate(),
                'gbp_pence' => $payment->amount_gbp_pence,
                'eur_cents' => (int) ceil($payment->amount_gbp_pence / ($exchangeRate / 100000)),
                'exchange_rate' => $exchangeRate / 100000,
                'buyer' => $payment->buyer,
                'payment_id' => $payment->id,
            ];
        });

        $years = [];
        foreach ($invoices as $invoice) {
            $year = (int) substr($invoice['issue_date'], 0, 4);
            $month = (int) substr($invoice['issue_date'], 5, 2);
            $trimestre = (int) ceil($month / 3);

            if (! isset($years[$year])) {
                $years[$year] = [
                    'total_gbp_pence' => 0,
                    'total_eur_cents' => 0,
                    'trimestres' => [],
                ];
            }

            if (! isset($years[$year]['trimestres'][$trimestre])) {
                $years[$year]['trimestres'][$trimestre] = [
                    'total_gbp_pence' => 0,
                    'total_eur_cents' => 0,
                ];
            }

            $years[$year]['total_gbp_pence'] += $invoice['gbp_pence'];
            $years[$year]['total_eur_cents'] += $invoice['eur_cents'];
            $years[$year]['trimestres'][$trimestre]['total_gbp_pence'] += $invoice['gbp_pence'];
            $years[$year]['trimestres'][$trimestre]['total_eur_cents'] += $invoice['eur_cents'];
        }
        krsort($years);

        return view('portal.invoices', [
            'invoices' => $invoices,
            'years' => $years,
        ]);
    }

    public function show(string $invoiceNumber): Response
    {
        if (! preg_match('/^(\d{4})-(\d{3})$/', $invoiceNumber, $matches)) {
            abort(404, 'Invalid invoice number format.');
        }

        $year = $matches[1];
        $sequenceNumber = $matches[2];

        $payment = Payment::where('sequence_number', $sequenceNumber)
            ->whereYear('datetime', $year)
            ->with('buyer', 'lessons.student', 'lessons.client')
            ->first();

        if (! $payment || ! $payment->buyer) {
            abort(404, 'Invoice not found.');
        }

        // Build seller address
        $sellerAddress = array_map(
            fn ($line) => trim($line),
            explode('|', config('services.seller_address')),
        );
        if (isset($sellerAddress[5])) {
            $sellerAddress[5] = CountryAlpha2::from(
                $sellerAddress[5]
            )?->getNameInLanguage(
                LanguageAlpha2::Spanish_Castilian
            ) ?? $sellerAddress[5];
        }

        // Build buyer address
        $buyer = $payment->buyer;
        $buyerAddress = array_values(array_filter(
            [
                $buyer->name,
                $buyer->address1,
                $buyer->address2,
                $buyer->address3,
                $buyer->town_city,
                $buyer->state_province_county,
                $buyer->zip_postal_code,
                $buyer->getCountryNameInSpanish(),
                $buyer->extra,
            ],
            fn ($line) => $line !== null && $line !== '',
        ));

        // Get exchange rate
        $issueDate = $payment->getDate();
        $exchangeRate = $this->exchangeRateService->getRateForDate($issueDate);

        $invoice = [
            'number' => $invoiceNumber,
            'issue_date' => $issueDate,
            'exchange_rate' => $exchangeRate,
            'notes' => 'Factura exenta de IVA según artículo 20. Uno. 10º - Ley 37/1992',
        ];

        $items = array_map(fn ($item) => [
            'date' => $item['lesson']
                ? $item['lesson']->datetime->format('Y-m-d H:i').' (GMT)'
                : $issueDate,
            'service' => $item['description'],
            'qty' => 1,
            'unit_price' => $item['price_gbp_pence'],
            'student' => $item['lesson']?->student?->name,
            'client' => $item['lesson']?->client?->name,
        ], $this->buildLineItems($payment));

        $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
        $cssFile = $manifest['resources/scss/invoice.scss']['file'];
        $cssPath = 'file://'.public_path("build/$cssFile");

        $pdf = Pdf::loadView('invoices.pdf', [
            'sellerAddress' => $sellerAddress,
            'buyerAddress' => $buyerAddress,
            'invoice' => $invoice,
            'items' => $items,
            'cssPath' => $cssPath,
        ]);

        $pdf->setPaper('A4', 'portrait');
        $pdf->setOption('defaultFont', 'DejaVu Sans');
        $pdf->setOption('isRemoteEnabled', true);
        $pdf->setOption('chroot', public_path('build'));

        return $pdf->stream("invoice-{$invoiceNumber}.pdf");
    }

    public function exportCsv(string $invoiceNumber): Response
    {
        if (! preg_match('/^(\d{4})-(\d{3})$/', $invoiceNumber, $matches)) {
            abort(404, 'Invalid invoice number format.');
        }

        $year = $matches[1];
        $sequenceNumber = $matches[2];

        $payment = Payment::where('sequence_number', $sequenceNumber)
            ->whereYear('datetime', $year)
            ->with('buyer', 'lessons.student', 'lessons.client')
            ->first();

        if (! $payment || ! $payment->buyer) {
            abort(404, 'Invoice not found.');
        }

        $issueDate = $payment->getDate();
        $exchangeRate = $this->exchangeRateService->getRateForDate($issueDate);
        $externalId = 'invoice_'.$year.'_'.$sequenceNumber;
        $reference = $payment->payment_reference;

        $columns = [
            'External ID',
            'Number',
            'Partner',
            'Invoice Bill Date',
            'Due Date',
            'Date',
            'Currency',
            'Currency Rate',
            'Payment Reference',
            'Reference',
            'Journal',
            'Payment Terms',
            'Narration',
            'Invoice Lines/Label',
            'Invoice Lines/Product',
            'Invoice Lines/Account',
            'Invoice Lines/Quantity',
            'Invoice Lines/Unit Price',
            'Invoice Lines/Taxes',
        ];

        $rows = array_map(fn ($item) => [
            'External ID' => $externalId,
            'Number' => $payment->getInvoiceNumber(),
            'Partner' => $payment->buyer->name,
            'Invoice Bill Date' => $issueDate,
            'Due Date' => $issueDate,
            'Date' => $issueDate,
            'Currency' => $payment->currency,
            'Currency Rate' => number_format($exchangeRate / 100000, 5),
            'Payment Reference' => $reference,
            'Reference' => $reference,
            'Journal' => 'Sales',
            'Payment Terms' => '',
            'Narration' => 'Factura exenta de IVA según artículo 20. Uno. 10º - Ley 37/1992',
            'Invoice Lines/Label' => $this->buildCsvLabel($item),
            'Invoice Lines/Product' => '',
            'Invoice Lines/Account' => $this->revenueAccount($payment->buyer->country),
            'Invoice Lines/Quantity' => 1,
            'Invoice Lines/Unit Price' => number_format($item['price_gbp_pence'] / 100, 2),
            'Invoice Lines/Taxes' => '',
        ], $this->buildLineItems($payment));

        $handle = fopen('php://memory', 'r+');
        fputcsv($handle, $columns);
        foreach ($rows as $row) {
            fputcsv($handle, array_map(fn ($col) => $row[$col], $columns));
        }
        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"invoice-{$invoiceNumber}.csv\"",
        ]);
    }

    private function revenueAccount(?string $countryAlpha2): string
    {
        if ($countryAlpha2 === null) {
            return '705200';
        }

        $country = CountryAlpha2::tryFrom($countryAlpha2);

        if ($country === CountryAlpha2::Spain) {
            return '705000';
        }

        if ($country?->isMemberOf(EU::class)) {
            return '705100';
        }

        return '705200';
    }

    /** @param array{description: string, price_gbp_pence: int, lesson: ?\App\Models\Lesson} $item */
    private function buildCsvLabel(array $item): string
    {
        if ($item['lesson'] === null) {
            return $item['description'];
        }

        $parts = [
            $item['description'],
            $item['lesson']->datetime->format('Y-m-d H:i').' (GMT)',
        ];

        if ($item['lesson']->student !== null) {
            $parts[] = 'Estudiante: '.$item['lesson']->student->name;
        }

        if ($item['lesson']->client !== null) {
            $parts[] = 'Cliente: '.$item['lesson']->client->name;
        }

        return implode("\n", $parts);
    }

    /** @return list<array{description: string, price_gbp_pence: int, lesson: ?\App\Models\Lesson}> */
    private function buildLineItems(Payment $payment): array
    {
        if ($payment->lessons->isNotEmpty()) {
            $items = $payment->lessons
                ->sortBy('datetime')
                ->map(fn ($lesson) => [
                    'description' => $lesson->getSpanishDescription(),
                    'price_gbp_pence' => $lesson->price_gbp_pence,
                    'lesson' => $lesson,
                ])
                ->values()
                ->toArray();

            $remainingAmount = $payment->getRemainingAmount();
            if ($remainingAmount > 0) {
                $items[] = [
                    'description' => 'Clases online de informática',
                    'price_gbp_pence' => $remainingAmount,
                    'lesson' => null,
                ];
            }

            return $items;
        }

        return [[
            'description' => 'Clases online de informática',
            'price_gbp_pence' => $payment->amount_gbp_pence,
            'lesson' => null,
        ]];
    }
}
