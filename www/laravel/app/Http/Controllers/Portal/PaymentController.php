<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class PaymentController extends Controller
{
    public function index(): View
    {
        return view('portal.payments.index', [
            'payments' => Payment::with('buyer')
                ->orderBy('datetime', 'desc')
                ->get(),
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'csv_file' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $file = $request->file('csv_file');
        $path = $file->getRealPath();

        $handle = fopen($path, 'r');
        if (! $handle) {
            return back()->with('error', 'Could not open the file.');
        }

        // Skip header row
        fgetcsv($handle);

        $imported = 0;
        $skipped = 0;

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                // Expected CSV format: TransferWise/Wise export
                // id, datetime, amount, currency, reference, buyer_name
                if (count($row) < 6) {
                    continue;
                }

                $id = $row[0];
                $datetime = $row[1];
                $amount = (int) (floatval($row[2]) * 100); // Convert to pence
                $currency = $row[3];
                $reference = $row[4];
                $buyerName = $row[5];

                // Skip if payment already exists
                if (Payment::find($id)) {
                    $skipped++;

                    continue;
                }

                // Find or create buyer
                $buyer = Buyer::firstOrCreate(
                    ['id' => $buyerName],
                    ['name' => $buyerName]
                );

                Payment::create([
                    'id' => $id,
                    'datetime' => $datetime,
                    'amount_gbp_pence' => $amount,
                    'currency' => $currency,
                    'payment_reference' => $reference,
                    'buyer_id' => $buyer->id,
                ]);

                $imported++;
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);

            return back()->with('error', 'Import failed: '.$e->getMessage());
        }

        fclose($handle);

        return redirect()->route('portal.payments.index')
            ->with('success', "Imported {$imported} payments. Skipped {$skipped} duplicates.");
    }

    public function clear(): RedirectResponse
    {
        Payment::truncate();

        return redirect()->route('portal.payments.index')
            ->with('success', 'All payments have been deleted.');
    }
}
