<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use PrinsFrank\Standards\Country\CountryAlpha2;

class BuyerController extends Controller
{
    public function index(): View
    {
        return view('portal.buyers.index', [
            'buyers' => Buyer::orderBy('name')->get(),
        ]);
    }

    public function edit(Buyer $buyer): View
    {
        $countries = [];
        foreach (CountryAlpha2::cases() as $country) {
            $countries[$country->value] = $country->name;
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

    public function clear(): RedirectResponse
    {
        Buyer::truncate();

        return redirect()->route('portal.buyers.index')
            ->with('success', 'All buyers have been deleted.');
    }
}
