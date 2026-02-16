<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\LessonFilterRequest;
use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Student;
use App\Services\CalendarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use RuntimeException;

class LessonController extends Controller
{
    public function __construct(
        private CalendarService $calendarService,
    ) {}

    public function index(): View
    {
        return view('portal.lessons.index', [
            'lessons' => Lesson::with(['student', 'client', 'buyer', 'payments'])
                ->orderBy('datetime', 'desc')
                ->get(),
            'calendarAuthorised' => $this->calendarService->isAuthorised(),
            'buyerOptions' => ['' => '- All -'] + Buyer::orderBy('name')->pluck('name', 'id')->toArray(),
            'studentOptions' => ['' => '- All -'] + Student::orderBy('name')->pluck('name', 'id')->toArray(),
            'clientOptions' => ['' => '- All -'] + Client::orderBy('name')->pluck('name', 'id')->toArray(),
        ]);
    }

    public function importFromCalendar(LessonFilterRequest $request): RedirectResponse
    {
        if (! $this->calendarService->isAuthorised()) {
            return redirect()->route('auth.microsoft');
        }

        $filters = array_filter([
            'buyer_id' => $request->buyer_id,
            'student_id' => $request->student_id ? (int) $request->student_id : null,
            'client_id' => $request->client_id ? (int) $request->client_id : null,
        ]);

        try {
            $imported = $this->calendarService->importLessonsFromCalendar(
                $request->start_date,
                $request->end_date,
                $filters,
            );
        } catch (RuntimeException $e) {
            return redirect()->route('portal.lessons.index')
                ->with('error', 'Calendar import failed: '.$e->getMessage());
        }

        return redirect()->route('portal.lessons.index')
            ->with('success', "Imported {$imported} lesson(s) from calendar.");
    }

    public function deleteFiltered(LessonFilterRequest $request): RedirectResponse
    {
        $query = Lesson::whereBetween('datetime', [
            $request->start_date.' 00:00:00',
            $request->end_date.' 23:59:59',
        ]);

        if ($request->filled('buyer_id')) {
            $query->where('buyer_id', $request->buyer_id);
        }
        if ($request->filled('student_id')) {
            $query->where('student_id', (int) $request->student_id);
        }
        if ($request->filled('client_id')) {
            $query->where('client_id', (int) $request->client_id);
        }

        $deleted = $query->delete();

        return redirect()->route('portal.lessons.index')
            ->with('success', "Deleted {$deleted} lesson(s).");
    }

    public function edit(Lesson $lesson): View
    {
        return view('portal.lessons.edit', [
            'lesson' => $lesson->load(['student', 'client', 'buyer']),
            'students' => ['' => '- None -'] + Student::orderBy('name')->pluck('name', 'id')->toArray(),
            'clients' => ['' => '- None -'] + Client::orderBy('name')->pluck('name', 'id')->toArray(),
            'buyers' => ['' => '- None -'] + Buyer::orderBy('name')->pluck('name', 'id')->toArray(),
        ]);
    }

    public function update(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'price_gbp' => ['required', 'numeric', 'min:0'],
            'student_id' => ['nullable', 'integer', 'exists:students,id'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'buyer_id' => ['nullable', 'string', 'max:100', 'exists:buyers,id'],
        ]);

        $data = [
            'price_gbp_pence' => poundsToPence((float) $validated['price_gbp']),
            'student_id' => $validated['student_id'] ?? null,
            'client_id' => $validated['client_id'] ?? null,
            'buyer_id' => $validated['buyer_id'] ?? null,
        ];

        if ($request->has('apply_to_student') && $lesson->student_id) {
            Lesson::where('student_id', $lesson->student_id)->update($data);

            return redirect()->route('portal.lessons.index')
                ->with('success', 'All lessons for '.$lesson->student->name.' updated successfully.');
        }

        $lesson->update($data);

        return redirect()->route('portal.lessons.index')
            ->with('success', 'Lesson updated successfully.');
    }

    public function destroy(Lesson $lesson): RedirectResponse
    {
        $lesson->delete();

        return redirect()->route('portal.lessons.index')
            ->with('success', 'Lesson deleted successfully.');
    }

    public function clear(): RedirectResponse
    {
        Lesson::truncate();

        return redirect()->route('portal.lessons.index')
            ->with('success', 'All lessons have been deleted.');
    }
}
