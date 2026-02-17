<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Buyer;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class PortalController extends Controller
{
    public function index(): View
    {
        $unmatchedPaymentCount = Payment::doesntHave('lessons')
            ->where('lesson_pending', false)
            ->count();
        $pendingPaymentCount = Payment::where('lesson_pending', true)->count();

        $unpaidLessonConstraint = fn ($q) => $q->where('paid', false);

        $buyersWithUnpaidLessons = Buyer::withCount(['lessons as unpaid_lesson_count' => $unpaidLessonConstraint])
            ->withSum(['lessons as unpaid_total_pence' => $unpaidLessonConstraint], 'price_gbp_pence')
            ->has('lessons', '>', 1, 'and', $unpaidLessonConstraint)
            ->orderByDesc('unpaid_lesson_count')
            ->get();

        return view('portal.dashboard', [
            'userEmail' => Auth::user()->email,
            'unmatchedPaymentCount' => $unmatchedPaymentCount,
            'pendingPaymentCount' => $pendingPaymentCount,
            'buyersWithUnpaidLessons' => $buyersWithUnpaidLessons,
        ]);
    }
}
