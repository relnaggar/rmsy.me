<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Services\CalendarService;
use Illuminate\Http\RedirectResponse;
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

    public function importFromCalendar(): RedirectResponse
    {
        if (! $this->calendarService->isAuthorised()) {
            return redirect()->route('auth.microsoft');
        }

        try {
            $this->calendarService->importLessonsFromCalendar();
        } catch (RuntimeException $e) {
            return redirect()->route('portal.lessons.index')
                ->with('error', 'Calendar import failed: '.$e->getMessage());
        }

        return redirect()->route('portal.lessons.index')
            ->with('success', 'Lessons imported from calendar.');
    }

    public function clear(): RedirectResponse
    {
        Lesson::truncate();

        return redirect()->route('portal.lessons.index')
            ->with('success', 'All lessons have been deleted.');
    }
}
