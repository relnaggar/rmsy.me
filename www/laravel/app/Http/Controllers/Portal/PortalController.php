<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class PortalController extends Controller
{
    public function index(): View
    {
        return view('portal.dashboard', [
            'userEmail' => Auth::user()->email,
        ]);
    }
}
