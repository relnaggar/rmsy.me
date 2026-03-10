<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AnalyticsController extends Controller
{
    public function index(AnalyticsService $service): View
    {
        $lastFullWeekStart = Carbon::now()->startOfWeek(Carbon::MONDAY)->subWeek();

        ['quarters' => $quarters, 'sources' => $sources] = $service->getData($lastFullWeekStart);

        $user = auth()->user();
        $targetMonthlyIncomeEurCents = $user->target_monthly_income_eur_cents;

        $targetLessonsPerWeek = null;
        if ($targetMonthlyIncomeEurCents !== null && ! empty($quarters)) {
            $currentQuarter = $quarters[array_key_first($quarters)];
            $lessonCount = $currentQuarter['total']['lesson_count'];
            $eurCents = $currentQuarter['total']['eur_cents'];
            $eurMissing = $currentQuarter['total']['eur_missing'];

            if ($lessonCount > 0 && ! $eurMissing) {
                $avgEurCentsPerLesson = $eurCents / $lessonCount;
                $targetLessonsPerWeek = $targetMonthlyIncomeEurCents / $avgEurCentsPerLesson / (52.0 / 12.0);
            }
        }

        return view('portal.analytics', compact('quarters', 'sources', 'targetMonthlyIncomeEurCents', 'targetLessonsPerWeek'));
    }

    public function setTarget(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'target_monthly_income_eur' => ['required', 'integer', 'min:0'],
        ]);

        auth()->user()->update([
            'target_monthly_income_eur_cents' => $validated['target_monthly_income_eur'] * 100,
        ]);

        return redirect()->route('portal.analytics.index');
    }
}
