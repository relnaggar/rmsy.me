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
    '/portal/login', [AuthController::class, 'showLogin']
)->name('login');
Route::post('/portal/login', [AuthController::class, 'login']);
Route::post(
    '/portal/logout', [AuthController::class, 'logout']
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
                Route::get("/{$resource}/edit", 'edit')->name('edit');
                Route::put("/{$resource}", 'update')->name('update');
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
        Route::get(
            '/lessons', [LessonController::class, 'index']
        )->name('lessons.index');
        Route::post(
            '/lessons/import',
            [LessonController::class, 'importFromCalendar']
        )->name('lessons.import');
        Route::delete(
            '/lessons', [LessonController::class, 'clear']
        )->name('lessons.clear');

        // Payments
        Route::get(
            '/payments', [PaymentController::class, 'index']
        )->name('payments.index');
        Route::post(
            '/payments', [PaymentController::class, 'import']
        )->name('payments.import');
        Route::delete(
            '/payments', [PaymentController::class, 'clear']
        )->name('payments.clear');

        // Invoices
        Route::get(
            '/invoices/{invoiceNumber}',
            [InvoiceController::class, 'show']
        )->name('invoices.show');
    }
);
