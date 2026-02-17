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

// API
Route::post(
    '/api/payments/import', [PaymentController::class, 'apiImport']
)->name('api.payments.import');

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

// Microsoft OAuth (authenticated)
Route::middleware('auth')->group(function () {
    Route::get(
        '/auth/login', [MicrosoftAuthController::class, 'redirect']
    )->name('auth.microsoft');
    Route::get(
        '/auth/callback', [MicrosoftAuthController::class, 'callback']
    )->name('auth.microsoft.callback');
});

// Portal (authenticated)
Route::middleware('auth')->prefix('portal')->name('portal.')->group(
    function () {
        Route::get('/', [PortalController::class, 'index'])->name('dashboard');

        // Buyers
        Route::controller(BuyerController::class)
            ->prefix('buyers')
            ->name('buyers.')
            ->where(['buyer' => '.*'])
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/create', 'create')->name('create');
                Route::post('/', 'store')->name('store');
                Route::get('/{buyer}', 'show')->name('show');
                Route::put('/{buyer}', 'update')->name('update');
                Route::delete('/{buyer}', 'destroy')->name('destroy');
                Route::post('/reassign', 'reassign')->name('reassign');
                Route::post('/assign', 'assign')->name('assign');
                Route::post('/assign-payments', 'assignPayments')->name('assignPayments');
            });

        // Students
        Route::controller(StudentController::class)
            ->prefix('students')
            ->name('students.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/{student}', 'show')->name('show');
                Route::put('/{student}', 'update')->name('update');
                Route::delete('/{student}', 'destroy')->name('destroy');
            });

        // Clients
        Route::controller(ClientController::class)
            ->prefix('clients')
            ->name('clients.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/{client}', 'show')->name('show');
                Route::put('/{client}', 'update')->name('update');
                Route::delete('/{client}', 'destroy')->name('destroy');
            });

        // Lessons
        Route::controller(LessonController::class)
            ->prefix('lessons')
            ->name('lessons.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/import-complete', 'completeImportAfterAuth')->name('importComplete');
                Route::post('/import', 'importFromCalendar')->name('import');
                Route::post('/delete-filtered', 'deleteFiltered')->name('deleteFiltered');
                Route::get('/{lesson}', 'show')->name('show');
                Route::put('/{lesson}', 'update')->name('update');
                Route::post('/{lesson}/apply-to-student', 'applyToStudent')->name('applyToStudent');
                Route::delete('/{lesson}', 'destroy')->name('destroy');
            });

        // Payments
        Route::controller(PaymentController::class)
            ->prefix('payments')
            ->name('payments.')
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::post('/import', 'import')->name('import');
                Route::get('/match-next', 'matchNext')->name('matchNext');
                Route::get('/{payment}', 'show')->name('show');
                Route::put('/{payment}', 'update')->name('update');
                Route::post('/{payment}/toggle-lesson-pending', 'toggleLessonPending')->name('toggleLessonPending');
                Route::post('/{payment}/match', 'storeMatches')->name('storeMatches');
                Route::delete('/{payment}/match', 'destroyMatches')->name('destroyMatches');
                Route::delete('/{payment}', 'destroy')->name('destroy');
            });

        // Invoices
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get(
            '/invoices/{invoiceNumber}',
            [InvoiceController::class, 'show']
        )->name('invoices.show');
    }
);
