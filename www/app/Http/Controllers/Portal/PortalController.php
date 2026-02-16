<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
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
        $pendingPaymentCount = Payment::doesntHave('lessons')
            ->where('lesson_pending', true)
            ->count();

        return view('portal.dashboard', [
            'userEmail' => Auth::user()->email,
            'unmatchedPaymentCount' => $unmatchedPaymentCount,
            'pendingPaymentCount' => $pendingPaymentCount,
        ]);
    }
}
