<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class LessonController extends Controller
{
    public function index(): View
    {
        return view('portal.lessons.index', [
            'lessons' => Lesson::with(['student', 'client', 'buyer'])
                ->orderBy('datetime', 'desc')
                ->get(),
        ]);
    }

    public function importFromCalendar(): RedirectResponse
    {
        // TODO: Implement calendar import using Microsoft Graph API
        // This would use the ms_access_token from the session

        return redirect()->route('portal.lessons.index')
            ->with('info', 'Calendar import not yet implemented.');
    }

    public function clear(): RedirectResponse
    {
        Lesson::truncate();

        return redirect()->route('portal.lessons.index')
            ->with('success', 'All lessons have been deleted.');
    }
}
