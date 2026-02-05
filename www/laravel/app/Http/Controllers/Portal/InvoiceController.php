<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\ExchangeRate;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function show(string $invoiceNumber): Response
    {
        // Parse invoice number (format: YYYY-NNN)
        if (! preg_match('/^(\d{4})-(\d{3})$/', $invoiceNumber, $matches)) {
            abort(404, 'Invalid invoice number format.');
        }

        $year = $matches[1];
        $sequenceNumber = $matches[2];

        $payment = Payment::where('sequence_number', $sequenceNumber)
            ->whereYear('datetime', $year)
            ->with('buyer')
            ->first();

        if (! $payment) {
            abort(404, 'Invoice not found.');
        }

        // Get exchange rate for the payment date
        $exchangeRate = ExchangeRate::where('date', $payment->datetime->format('Y-m-d'))->first();

        $sellerAddress = config('services.seller_address', "Ramsey El-Naggar\nLondon, UK");

        $pdf = Pdf::loadView('invoices.pdf', [
            'payment' => $payment,
            'invoiceNumber' => $invoiceNumber,
            'sellerAddress' => $sellerAddress,
            'exchangeRate' => $exchangeRate?->gbpeur,
        ]);

        return $pdf->download("invoice-{$invoiceNumber}.pdf");
    }
}
