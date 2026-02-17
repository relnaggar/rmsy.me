<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ClientController extends Controller
{
    public function index(): View
    {
        return view('portal.clients.index', [
            'clients' => Client::orderBy('name')->get(),
        ]);
    }

    public function show(Client $client): View
    {
        $client->load(['lessons' => fn ($q) => $q->with(['student', 'buyer', 'payments'])->orderBy('datetime')]);

        return view('portal.clients.show', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $client->update($validated);

        return redirect()->route('portal.clients.show', $client)
            ->with('success', 'Client updated successfully.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return redirect()->route('portal.clients.index')
            ->with('success', 'Client deleted successfully.');
    }
}
