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

    public function edit(Client $client): View
    {
        return view('portal.clients.edit', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $client->update($validated);

        return redirect()->route('portal.clients.index')
            ->with('success', 'Client updated successfully.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $client->delete();

        return redirect()->route('portal.clients.index')
            ->with('success', 'Client deleted successfully.');
    }

    public function clear(): RedirectResponse
    {
        Client::truncate();

        return redirect()->route('portal.clients.index')
            ->with('success', 'All clients have been deleted.');
    }
}
