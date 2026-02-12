<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Lesson;
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

        return view('portal.buyers.index', [
            'buyers' => $buyers,
            'buyerOptions' => $buyers->pluck('name', 'id')->toArray(),
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

    public function destroy(Buyer $buyer): RedirectResponse
    {
        $buyer->delete();

        return redirect()->route('portal.buyers.index')
            ->with('success', 'Buyer deleted successfully.');
    }

    public function clear(): RedirectResponse
    {
        Buyer::truncate();

        return redirect()->route('portal.buyers.index')
            ->with('success', 'All buyers have been deleted.');
    }
}
