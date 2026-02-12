<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Lesson;
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
            'lessons' => Lesson::with(['student', 'client', 'buyer'])
                ->orderBy('datetime', 'desc')
                ->get(),
            'calendarAuthorised' => $this->calendarService->isAuthorised(),
        ]);
    }

    public function importFromCalendar(Request $request): RedirectResponse
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if (! $this->calendarService->isAuthorised()) {
            return redirect()->route('auth.microsoft');
        }

        try {
            $this->calendarService->importLessonsFromCalendar($request->start_date, $request->end_date);
        } catch (RuntimeException $e) {
            return redirect()->route('portal.lessons.index')
                ->with('error', 'Calendar import failed: '.$e->getMessage());
        }

        return redirect()->route('portal.lessons.index')
            ->with('success', 'Lessons imported from calendar.');
    }

    public function edit(Lesson $lesson): View
    {
        $buyers = ['' => '- None -'] + Buyer::orderBy('name')->pluck('name', 'id')->toArray();

        return view('portal.lessons.edit', [
            'lesson' => $lesson->load(['student', 'client', 'buyer']),
            'buyers' => $buyers,
        ]);
    }

    public function update(Request $request, Lesson $lesson): RedirectResponse
    {
        $validated = $request->validate([
            'buyer_id' => ['nullable', 'string', 'max:100', 'exists:buyers,id'],
        ]);

        $lesson->update($validated);

        return redirect()->route('portal.lessons.index')
            ->with('success', 'Lesson buyer updated successfully.');
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
