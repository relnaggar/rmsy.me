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
Route::get('/projects', [ProjectsController::class, 'index'])->name('projects.index');
Route::get('/projects/{slug}', [ProjectsController::class, 'show'])->name('projects.show');
Route::get('/contact', [ContactController::class, 'show'])->name('contact.show');
Route::post('/contact', [ContactController::class, 'submit'])->name('contact.submit');

// External redirects
Route::redirect('/free-meeting', 'https://calendly.com/relnaggar/free-meeting');
Route::redirect('/github', 'https://github.com/relnaggar', 301);
Route::redirect('/linkedin', 'https://www.linkedin.com/in/relnaggar/', 301);
Route::redirect('/resumes/full-stack-developer', 'https://docs.google.com/document/d/1234', 301);
Route::redirect('/resumes/educator', 'https://docs.google.com/document/d/5678', 301);

// Authentication
Route::get('/portal/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/portal/login', [AuthController::class, 'login']);
Route::post('/portal/logout', [AuthController::class, 'logout'])->name('logout');

// Microsoft OAuth
Route::get('/auth/login', [MicrosoftAuthController::class, 'redirect'])->name('auth.microsoft');
Route::get('/auth/callback', [MicrosoftAuthController::class, 'callback'])->name('auth.microsoft.callback');

// Portal (authenticated)
Route::middleware('auth')->prefix('portal')->name('portal.')->group(function () {
    Route::get('/', [PortalController::class, 'index'])->name('dashboard');

    // Buyers
    Route::get('/buyers', [BuyerController::class, 'index'])->name('buyers.index');
    Route::get('/buyers/{buyer}/edit', [BuyerController::class, 'edit'])->name('buyers.edit');
    Route::put('/buyers/{buyer}', [BuyerController::class, 'update'])->name('buyers.update');
    Route::delete('/buyers', [BuyerController::class, 'clear'])->name('buyers.clear');

    // Students
    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::get('/students/{student}/edit', [StudentController::class, 'edit'])->name('students.edit');
    Route::put('/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('/students', [StudentController::class, 'clear'])->name('students.clear');

    // Clients
    Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
    Route::get('/clients/{client}/edit', [ClientController::class, 'edit'])->name('clients.edit');
    Route::put('/clients/{client}', [ClientController::class, 'update'])->name('clients.update');
    Route::delete('/clients', [ClientController::class, 'clear'])->name('clients.clear');

    // Lessons
    Route::get('/lessons', [LessonController::class, 'index'])->name('lessons.index');
    Route::post('/lessons/import', [LessonController::class, 'importFromCalendar'])->name('lessons.import');
    Route::delete('/lessons', [LessonController::class, 'clear'])->name('lessons.clear');

    // Payments
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments', [PaymentController::class, 'import'])->name('payments.import');
    Route::delete('/payments', [PaymentController::class, 'clear'])->name('payments.clear');

    // Invoices
    Route::get('/invoices/{invoiceNumber}', [InvoiceController::class, 'show'])->name('invoices.show');
});
