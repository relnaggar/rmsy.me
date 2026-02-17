<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\ExchangeRateService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use PrinsFrank\Standards\Country\CountryAlpha2;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class InvoiceController extends Controller
{
    public function __construct(
        private ExchangeRateService $exchangeRateService,
    ) {}

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

        if ($payment->lessons->isNotEmpty()) {
            $items = $payment->lessons
                ->sortBy('datetime')
                ->map(fn ($lesson) => [
                    'date' => $lesson->datetime->format('Y-m-d'),
                    'service' => $lesson->getSpanishDescription(),
                    'qty' => 1,
                    'unit_price' => $lesson->price_gbp_pence,
                    'student' => $lesson->student?->name,
                    'client' => $lesson->client?->name,
                ])
                ->values()
                ->toArray();

            $remainingAmount = $payment->getRemainingAmount();
            if ($remainingAmount > 0) {
                $items[] = [
                    'date' => $issueDate,
                    'service' => 'Clases online de informática',
                    'qty' => 1,
                    'unit_price' => $remainingAmount,
                ];
            }
        } else {
            $items = [
                [
                    'date' => $issueDate,
                    'service' => 'Clases online de informática',
                    'qty' => 1,
                    'unit_price' => $payment->amount_gbp_pence,
                ],
            ];
        }

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
}
