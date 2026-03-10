<?php

declare(strict_types=1);

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\View\View;

class AnalyticsController extends Controller
{
    public function index(AnalyticsService $service): View
    {
        $lastFullWeekStart = Carbon::now()->startOfWeek(Carbon::MONDAY)->subWeek();

        ['quarters' => $quarters, 'sources' => $sources] = $service->getData($lastFullWeekStart);

        return view('portal.analytics', compact('quarters', 'sources'));
    }
}
