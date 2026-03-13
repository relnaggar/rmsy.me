<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use PrinsFrank\Standards\Country\CountryAlpha2;
use PrinsFrank\Standards\Language\LanguageAlpha2;

class BuyerController extends Controller
{
    public function index(): View
    {
        $buyers = Buyer::withCount('lessons')->orderBy('name')->get();
        $students = Student::orderBy('name')->get();
        $clients = Client::orderBy('name')->get();

        $payers = Payment::whereNotNull('payer')
            ->distinct()
            ->orderBy('payer')
            ->pluck('payer');
        $payerOptions = $payers->mapWithKeys(fn ($payer) => [$payer => $payer])->toArray();

        return view('portal.buyers.index', [
            'buyers' => $buyers,
            'buyerOptions' => $buyers->pluck('name', 'id')->toArray(),
            'studentOptions' => $students->pluck('name', 'id')->toArray(),
            'clientOptions' => $clients->pluck('name', 'id')->toArray(),
            'payerOptions' => $payerOptions,
        ]);
    }

    public function create(): View
    {
        $countries = [];
        foreach (CountryAlpha2::cases() as $country) {
            $countries[$country->value] = $country->getNameInLanguage(
                LanguageAlpha2::English
            );
        }

        return view('portal.buyers.create', [
            'countries' => $countries,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'string', 'max:100', 'unique:buyers,id'],
            'name' => ['required', 'string', 'max:255'],
            'address1' => ['nullable', 'string', 'max:255'],
            'address2' => ['nullable', 'string', 'max:255'],
            'address3' => ['nullable', 'string', 'max:255'],
            'town_city' => ['nullable', 'string', 'max:100'],
            'state_province_county' => ['nullable', 'string', 'max:100'],
            'zip_postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['required', 'string', 'size:2'],
            'extra' => ['nullable', 'string', 'max:255'],
            'auto_pay' => ['boolean'],
        ]);

        Buyer::create($validated);

        return redirect()->route('portal.buyers.index')
            ->with('success', 'Buyer created successfully.');
    }

    public function show(Request $request, Buyer $buyer): View
    {
        [$startDate, $endDate] = $this->lessonDateDefaults(
            $request,
            $buyer->lessons()->min('datetime'),
            $buyer->lessons()->max('datetime'),
        );
        $studentFilter = (string) $request->query('student_id', '');
        $clientFilter = (string) $request->query('client_id', '');
        $completeFilter = (string) $request->query('complete', 'all');

        $lessonsQuery = $buyer->lessons()
            ->with(['student', 'client', 'payments'])
            ->orderBy('datetime', 'desc');

        if ($studentFilter !== '') {
            $lessonsQuery->where('student_id', (int) $studentFilter);
        }
        if ($clientFilter !== '') {
            $lessonsQuery->where('client_id', (int) $clientFilter);
        }
        $this->applyLessonDateFilters($lessonsQuery, $startDate, $endDate);
        $this->applyLessonCompleteFilter($lessonsQuery, $completeFilter);

        $countries = [];
        foreach (CountryAlpha2::cases() as $country) {
            $countries[$country->value] = $country->getNameInLanguage(
                LanguageAlpha2::English
            );
        }

        return view('portal.buyers.show', [
            'buyer' => $buyer,
            'countries' => $countries,
            'lessons' => $lessonsQuery->get(),
            'startDateFilter' => $startDate,
            'endDateFilter' => $endDate,
            'studentFilter' => $studentFilter,
            'clientFilter' => $clientFilter,
            'buyerFilter' => (string) $buyer->id,
            'completeFilter' => $completeFilter,
            'studentOptions' => self::withAllOption(
                Student::whereIn('id', $buyer->lessons()->whereNotNull('student_id')->distinct()->pluck('student_id'))
                    ->orderBy('name')->pluck('name', 'id')->toArray()
            ),
            'clientOptions' => self::withAllOption(
                Client::whereIn('id', $buyer->lessons()->whereNotNull('client_id')->distinct()->pluck('client_id'))
                    ->orderBy('name')->pluck('name', 'id')->toArray()
            ),
            'buyerOptions' => [$buyer->id => $buyer->name],
        ]);
    }

    public function update(Request $request, Buyer $buyer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'address1' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address3' => ['sometimes', 'nullable', 'string', 'max:255'],
            'town_city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state_province_county' => ['sometimes', 'nullable', 'string', 'max:100'],
            'zip_postal_code' => ['sometimes', 'nullable', 'string', 'max:20'],
            'country' => ['sometimes', 'required', 'string', 'size:2'],
            'extra' => ['sometimes', 'nullable', 'string', 'max:255'],
            'auto_pay' => ['sometimes', 'boolean'],
        ]);

        $buyer->update($validated);

        return redirect()->route('portal.buyers.show', $buyer)
            ->with('success', 'Buyer updated successfully.');
    }

    public function reassign(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_buyer_id' => ['required', 'string', 'max:100', 'exists:buyers,id'],
            'to_buyer_id' => ['required', 'string', 'max:100', 'exists:buyers,id', 'different:from_buyer_id'],
        ]);

        $count = Lesson::where('buyer_id', $validated['from_buyer_id'])
            ->update(['buyer_id' => $validated['to_buyer_id']]);

        $fromBuyer = Buyer::find($validated['from_buyer_id']);
        $toBuyer = Buyer::find($validated['to_buyer_id']);

        return redirect()->route('portal.buyers.index')
            ->with('success', "Reassigned {$count} lesson(s) from {$fromBuyer->name} to {$toBuyer->name}.");
    }

    public function assign(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'filter_type' => ['required', 'string', 'in:student,client'],
            'filter_id' => ['required', 'integer'],
            'buyer_id' => ['required', 'string', 'max:100', 'exists:buyers,id'],
        ]);

        $filterType = $validated['filter_type'];
        $filterModel = $filterType === 'student'
            ? Student::findOrFail($validated['filter_id'])
            : Client::findOrFail($validated['filter_id']);

        $count = Lesson::where($filterType.'_id', $validated['filter_id'])
            ->update(['buyer_id' => $validated['buyer_id']]);

        $buyer = Buyer::find($validated['buyer_id']);

        return redirect()->route('portal.buyers.index')
            ->with('success', "Assigned {$count} lesson(s) for {$filterType} {$filterModel->name} to {$buyer->name}.");
    }

    public function assignPayments(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'payer' => ['required', 'string', 'max:255'],
            'buyer_id' => ['required', 'string', 'max:100', 'exists:buyers,id'],
        ]);

        $count = Payment::where('payer', $validated['payer'])
            ->update(['buyer_id' => $validated['buyer_id']]);

        $buyer = Buyer::find($validated['buyer_id']);

        return redirect()->route('portal.buyers.index')
            ->with('success', "Assigned {$count} payment(s) from payer {$validated['payer']} to {$buyer->name}.");
    }

    public function destroy(Buyer $buyer): RedirectResponse
    {
        $buyer->delete();

        return redirect()->route('portal.buyers.index')
            ->with('success', 'Buyer deleted successfully.');
    }
}
