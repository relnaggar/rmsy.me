<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\MicrosoftAuthController;
use App\Http\Controllers\Portal\BuyerController;
use App\Http\Controllers\Portal\ClientController;
use App\Http\Controllers\Portal\InvoiceController;
use App\Http\Controllers\Portal\LessonController;
use App\Http\Controllers\Portal\PaymentController;
use App\Http\Controllers\Portal\PortalController;
use App\Http\Controllers\Portal\StudentController;
use App\Http\Controllers\ProjectsController;
use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

// Public pages
Route::get('/', [SiteController::class, 'index'])->name('home');
Route::get('/about', [SiteController::class, 'about'])->name('about');
Route::get(
    '/projects', [ProjectsController::class, 'index']
)->name('projects.index');
Route::get(
    '/projects/{slug}', [ProjectsController::class, 'show']
)->name('projects.show');
Route::get(
    '/contact', [ContactController::class, 'show']
)->name('contact.show');
Route::post(
    '/contact', [ContactController::class, 'submit']
)->name('contact.submit');

// Webhooks
Route::post(
    '/wise-deposit', [SiteController::class, 'wiseDeposit']
)->name('wise-deposit');

// External redirects
Route::redirect('/free-meeting', 'https://calendly.com/relnaggar/free-meeting');
Route::redirect('/github', 'https://github.com/relnaggar', 301);
Route::redirect('/linkedin', 'https://www.linkedin.com/in/relnaggar/', 301);
Route::redirect(
    '/resumes/full-stack-developer',
    media('/resumes/ramsey-el-naggar-full-stack-developer.pdf'),
    301
);
Route::redirect(
    '/resumes/educator',
    media('/resumes/ramsey-el-naggar-educator.pdf'),
    301
);

// Authentication
Route::get(
    '/login', [AuthController::class, 'showLogin']
)->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post(
    '/logout', [AuthController::class, 'logout']
)->name('logout');

// Microsoft OAuth
Route::get(
    '/auth/login', [MicrosoftAuthController::class, 'redirect']
)->name('auth.microsoft');
Route::get(
    '/auth/callback', [MicrosoftAuthController::class, 'callback']
)->name('auth.microsoft.callback');

// Portal (authenticated)
Route::middleware('auth')->prefix('portal')->name('portal.')->group(
    function () {
        Route::get('/', [PortalController::class, 'index'])->name('dashboard');

        $resourceGroupCallback = function ($resource): callable {
            return function () use ($resource) {
                Route::get('/', 'index')->name('index');
                Route::get('/{' . $resource . '}/edit', 'edit')->name('edit');
                Route::put('/{' . $resource . '}', 'update')->name('update');
                Route::delete('/', 'clear')->name('clear');
            };
        };

        // Buyers
        Route::controller(BuyerController::class)
            ->prefix('buyers')
            ->name('buyers.')
            ->group($resourceGroupCallback('buyer'));


        // Students
        Route::controller(StudentController::class)
            ->prefix('students')
            ->name('students.')
            ->group($resourceGroupCallback('student'));

        // Clients
        Route::controller(ClientController::class)
            ->prefix('clients')
            ->name('clients.')
            ->group($resourceGroupCallback('client'));

        // Lessons
        Route::controller(LessonController::class)
            ->prefix('lessons')
            ->name('lessons.')
            ->group(function () {
                 Route::get('/', 'index')->name('index');
                 Route::post('/import', 'importFromCalendar')->name('import');
                 Route::delete('/', 'clear')->name('clear');
            });

        // Payments
        Route::controller(PaymentController::class)
            ->prefix('payments')
            ->name('payments.')
            ->group(function () {
                 Route::get('/', 'index')->name('index');
                 Route::post('/import', 'import')->name('import');
                 Route::delete('/', 'clear')->name('clear');
            });

        // Invoices
        Route::get(
            '/invoices/{invoiceNumber}',
            [InvoiceController::class, 'show']
        )->name('invoices.show');
    }
);
