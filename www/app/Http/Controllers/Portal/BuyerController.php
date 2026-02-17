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
        $buyers = Buyer::orderBy('name')->get();
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
        ]);

        Buyer::create($validated);

        return redirect()->route('portal.buyers.index')
            ->with('success', 'Buyer created successfully.');
    }

    public function edit(Buyer $buyer): View
    {
        $countries = [];
        foreach (CountryAlpha2::cases() as $country) {
            $countries[$country->value] = $country->getNameInLanguage(
                LanguageAlpha2::English
            );
        }

        return view('portal.buyers.edit', [
            'buyer' => $buyer,
            'countries' => $countries,
        ]);
    }

    public function update(Request $request, Buyer $buyer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address1' => ['nullable', 'string', 'max:255'],
            'address2' => ['nullable', 'string', 'max:255'],
            'address3' => ['nullable', 'string', 'max:255'],
            'town_city' => ['nullable', 'string', 'max:100'],
            'state_province_county' => ['nullable', 'string', 'max:100'],
            'zip_postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['required', 'string', 'size:2'],
            'extra' => ['nullable', 'string', 'max:255'],
        ]);

        $buyer->update($validated);

        return redirect()->route('portal.buyers.index')
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
