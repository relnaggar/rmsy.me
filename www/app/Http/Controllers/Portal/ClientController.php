<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Client;
use App\Models\Student;
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

    public function show(Request $request, Client $client): View
    {
        [$startDate, $endDate] = $this->lessonDateDefaults(
            $request,
            $client->lessons()->min('datetime'),
            $client->lessons()->max('datetime'),
        );
        $studentFilter = (string) $request->query('student_id', '');
        $buyerFilter = (string) $request->query('buyer_id', '');
        $statusFilters = $this->readLessonStatusFilters($request);

        $lessonsQuery = $client->lessons()
            ->with(['student', 'buyer', 'payments'])
            ->orderBy('datetime', 'desc');

        if ($studentFilter !== '') {
            $lessonsQuery->where('student_id', (int) $studentFilter);
        }
        if ($buyerFilter !== '') {
            $lessonsQuery->where('buyer_id', $buyerFilter);
        }
        $this->applyLessonDateFilters($lessonsQuery, $startDate, $endDate);
        $this->applyLessonStatusFilters($lessonsQuery, $statusFilters);

        return view('portal.clients.show', [
            'client' => $client,
            'lessons' => $lessonsQuery->get(),
            'startDateFilter' => $startDate,
            'endDateFilter' => $endDate,
            'studentFilter' => $studentFilter,
            'buyerFilter' => $buyerFilter,
            'clientFilter' => (string) $client->id,
            'completeFilter' => $statusFilters['complete'],
            'paidFilter' => $statusFilters['paid'],
            'studentOptions' => self::withAllOption(
                Student::whereIn('id', $client->lessons()->whereNotNull('student_id')->distinct()->pluck('student_id'))
                    ->orderBy('name')->pluck('name', 'id')->toArray()
            ),
            'buyerOptions' => self::withAllOption(
                Buyer::whereIn('id', $client->lessons()->whereNotNull('buyer_id')->distinct()->pluck('buyer_id'))
                    ->orderBy('name')->pluck('name', 'id')->toArray()
            ),
            'clientOptions' => [$client->id => $client->name],
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
