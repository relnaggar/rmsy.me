<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Lesson;
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
                ->withCount('lessons')
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
        $affectedYears = [];

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                // Expected CSV format: TransferWise/Wise export
                // id, datetime, amount, currency, reference, buyer_name
                if (count($row) < 6) {
                    continue;
                }

                $id = $row[0];
                // Skip if TransferWise ID doesn't start with "TRANSFER-"
                if (! str_starts_with($id, 'TRANSFER-')) {
                    continue;
                }
                // Skip if payment already exists
                if (Payment::find($id)) {
                    $skipped++;

                    continue;
                }

                $amount = poundsToPence(floatval($row[3]));
                // Skip negative amounts (payouts)
                if (floatval($row[3]) < 0) {
                    continue;
                }

                $datetime = $row[2];
                $currency = $row[4];
                $reference = $row[6];
                $buyerName = $row[11];

                // Find or create buyer
                $buyer = Buyer::firstOrCreate(
                    ['id' => $buyerName], // ID for buyer is the same as the name
                    ['name' => $buyerName]
                );

                $payment = Payment::create([
                    'id' => $id,
                    'datetime' => $datetime,
                    'amount_gbp_pence' => $amount,
                    'currency' => $currency,
                    'payment_reference' => $reference,
                    'payer' => $buyerName,
                    'buyer_id' => $buyer->id,
                ]);

                $year = $payment->getYear();
                if (! in_array($year, $affectedYears)) {
                    $affectedYears[] = $year;
                }

                $imported++;
            }

            // Assign sequence numbers for affected years
            $this->updateSequenceNumbers($affectedYears);

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

    private function updateSequenceNumbers(array $years): void
    {
        $payments = Payment::orderBy('datetime', 'asc')->get();
        $sequenceNumbers = [];

        foreach ($payments as $payment) {
            $year = $payment->getYear();

            if (! in_array($year, $years)) {
                continue;
            }

            if (! isset($sequenceNumbers[$year])) {
                $sequenceNumbers[$year] = 1;
            } else {
                $sequenceNumbers[$year]++;
            }

            $sequenceNumberStr = str_pad((string) $sequenceNumbers[$year], 3, '0', STR_PAD_LEFT);

            if ($payment->sequence_number === $sequenceNumberStr) {
                continue;
            }

            $payment->update(['sequence_number' => $sequenceNumberStr]);
        }
    }

    public function show(Request $request, Payment $payment): View
    {
        $payment->load('buyer', 'lessons');
        $buyers = ['' => '- None -'] + Buyer::orderBy('name')->pluck('name', 'id')->toArray();

        $matchedLessonIds = $payment->lessons->pluck('id')->toArray();

        $lessons = $payment->buyer_id
            ? Lesson::with('student', 'client')
                ->where('buyer_id', $payment->buyer_id)
                ->where(function ($query) use ($matchedLessonIds) {
                    $query->where('paid', false)
                        ->orWhereIn('id', $matchedLessonIds);
                })
                ->orderBy('datetime', 'asc')
                ->get()
            : collect();

        $suggestedIds = $lessons
            ->filter(fn ($lesson) => $lesson->datetime->lte($payment->datetime) || in_array($lesson->id, $matchedLessonIds))
            ->pluck('id')
            ->toArray();

        return view('portal.payments.show', [
            'payment' => $payment,
            'buyers' => $buyers,
            'lessons' => $lessons,
            'matchedLessonIds' => $matchedLessonIds,
            'suggestedIds' => $suggestedIds,
            'next' => $request->has('next'),
            'prevByBuyer' => $payment->previousForBuyer(),
            'nextByBuyer' => $payment->nextForBuyer(),
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'buyer_id' => ['nullable', 'string', 'max:100', 'exists:buyers,id'],
        ]);

        $payment->update($validated);

        return redirect()->route('portal.payments.show', $payment)
            ->with('success', 'Payment buyer updated successfully.');
    }

    public function toggleLessonPending(Payment $payment): RedirectResponse
    {
        $payment->update(['lesson_pending' => ! $payment->lesson_pending]);

        $status = $payment->lesson_pending ? 'marked as lesson pending' : 'no longer lesson pending';

        return redirect()->route('portal.payments.show', $payment)
            ->with('success', "Payment {$status}.");
    }

    public function matchNext(): RedirectResponse
    {
        $payment = Payment::doesntHave('lessons')
            ->where('lesson_pending', false)
            ->orderBy('datetime', 'asc')
            ->first();

        if (! $payment) {
            return redirect()->route('portal.dashboard')
                ->with('success', 'All payments have been matched.');
        }

        return redirect()->route('portal.payments.show', ['payment' => $payment, 'next' => 1]);
    }

    public function storeMatches(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'lesson_ids' => ['nullable', 'array'],
            'lesson_ids.*' => ['integer', 'exists:lessons,id'],
        ]);

        $newIds = $validated['lesson_ids'] ?? [];

        $selectedTotal = (int) Lesson::whereIn('id', $newIds)->sum('price_gbp_pence');
        if ($selectedTotal !== $payment->amount_gbp_pence) {
            return back()->withErrors(['lesson_ids' => 'Selected lessons total (£'.penceToPounds($selectedTotal).') does not match payment amount (£'.penceToPounds($payment->amount_gbp_pence).').']);
        }

        $previousIds = $payment->lessons->pluck('id')->toArray();

        DB::transaction(function () use ($payment, $newIds, $previousIds) {
            $payment->lessons()->sync($newIds);

            Lesson::whereIn('id', $newIds)->update(['paid' => true]);

            $removedIds = array_diff($previousIds, $newIds);
            if ($removedIds) {
                Lesson::whereIn('id', $removedIds)->update(['paid' => false]);
            }
        });

        $count = count($newIds);

        if ($request->has('next')) {
            return redirect()->route('portal.payments.matchNext')
                ->with('success', "Matched {$count} lesson(s) to payment.");
        }

        return redirect()->route('portal.payments.show', $payment)
            ->with('success', "Matched {$count} lesson(s) to payment.");
    }

    public function destroyMatches(Payment $payment): RedirectResponse
    {
        $lessonIds = $payment->lessons->pluck('id')->toArray();

        DB::transaction(function () use ($payment, $lessonIds) {
            $payment->lessons()->detach();

            if ($lessonIds) {
                Lesson::whereIn('id', $lessonIds)->update(['paid' => false]);
            }
        });

        return redirect()->route('portal.payments.show', $payment)
            ->with('success', 'Payment unmatched successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        $year = $payment->getYear();
        $payment->delete();
        $this->updateSequenceNumbers([$year]);

        return redirect()->route('portal.payments.index')
            ->with('success', 'Payment deleted successfully.');
    }

    public function clear(): RedirectResponse
    {
        Payment::truncate();

        return redirect()->route('portal.payments.index')
            ->with('success', 'All payments have been deleted.');
    }
}
