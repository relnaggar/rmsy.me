<?php

declare(strict_types=1);

use App\Models\Buyer;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('e2e:seed', function () {
    // Keep reruns deterministic by clearing throttle/cache state between suites.
    Artisan::call('cache:clear');

    $fixture = [
        'user_email' => 'q@q',
        'user_password' => 'q',
        'buyer_id' => 'e2e-acme',
        'buyer_name' => 'E2E Acme',
        'student_name' => 'E2E Student Fixture',
        'payment_id' => 'E2E-PAY-001',
        'payment_datetime' => '2099-12-31 12:00:00',
        'lesson_datetime' => '2099-12-31 09:00:00',
        'payment_reference' => 'E2E fixture payment',
        'payer' => 'E2E Payer',
        'description' => 'E2E fixture lesson (local test data)',
    ];

    User::updateOrCreate(
        ['email' => $fixture['user_email']],
        [
            'name' => 'E2E User',
            'password' => Hash::make($fixture['user_password']),
        ]
    );

    Buyer::updateOrCreate(
        ['id' => $fixture['buyer_id']],
        ['name' => $fixture['buyer_name']]
    );

    $student = Student::firstOrCreate(['name' => $fixture['student_name']]);

    $payment = Payment::updateOrCreate(
        ['id' => $fixture['payment_id']],
        [
            'datetime' => $fixture['payment_datetime'],
            'amount_gbp_pence' => 5000,
            'currency' => 'GBP',
            'payment_reference' => $fixture['payment_reference'],
            'payer' => $fixture['payer'],
            'buyer_id' => $fixture['buyer_id'],
            'sequence_number' => null,
            'lesson_pending' => false,
        ]
    );

    $lesson = Lesson::updateOrCreate(
        ['datetime' => $fixture['lesson_datetime']],
        [
            'description' => $fixture['description'],
            'duration_minutes' => 55,
            'repeat_weeks' => 0,
            'price_gbp_pence' => 5000,
            'paid' => false,
            'student_id' => $student->id,
            'client_id' => null,
            'buyer_id' => $fixture['buyer_id'],
        ]
    );

    // Reset only fixture linkage to keep reruns deterministic without touching non-fixture rows.
    $lesson->payments()->detach();
    $payment->lessons()->detach();

    // Always return fixtures to the pre-match state expected by E2E tests.
    $lesson->update(['paid' => false]);
    $payment->update(['lesson_pending' => false]);

    $this->info("E2E fixtures seeded: {$payment->id} and lesson {$lesson->id}.");
})->purpose('Seed deterministic fixtures for local Playwright E2E tests');
