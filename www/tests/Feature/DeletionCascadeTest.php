<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeletionCascadeTest extends TestCase
{
    use RefreshDatabase;

    public function test_deleting_buyer_nullifies_lesson_buyer_id(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $lesson = Lesson::factory()->create(['buyer_id' => 'acme']);

        Buyer::find('acme')->delete();

        $this->assertNull($lesson->fresh()->buyer_id);
        $this->assertNotNull(Lesson::find($lesson->id));
    }

    public function test_deleting_buyer_nullifies_payment_buyer_id(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'buyer_id' => 'acme']);

        Buyer::find('acme')->delete();

        $this->assertNull($payment->fresh()->buyer_id);
        $this->assertNotNull(Payment::find('PAY-1'));
    }

    public function test_deleting_student_nullifies_lesson_student_id(): void
    {
        $student = Student::factory()->create(['name' => 'Alice']);
        $lesson = Lesson::factory()->create(['student_id' => $student->id]);

        $student->delete();

        $this->assertNull($lesson->fresh()->student_id);
        $this->assertNotNull(Lesson::find($lesson->id));
    }

    public function test_deleting_client_nullifies_lesson_client_id(): void
    {
        $client = Client::factory()->create(['name' => 'Acme Corp']);
        $lesson = Lesson::factory()->create(['client_id' => $client->id]);

        $client->delete();

        $this->assertNull($lesson->fresh()->client_id);
        $this->assertNotNull(Lesson::find($lesson->id));
    }

    public function test_deleting_lesson_cascades_pivot_rows(): void
    {
        $lesson = Lesson::factory()->create();
        $payment = Payment::factory()->create(['id' => 'PAY-1']);
        $payment->lessons()->attach($lesson->id);

        $this->assertDatabaseCount('lesson_payment', 1);

        $lesson->delete();

        $this->assertDatabaseCount('lesson_payment', 0);
        $this->assertNotNull(Payment::find('PAY-1'));
    }

    public function test_deleting_payment_cascades_pivot_rows(): void
    {
        $lesson = Lesson::factory()->create();
        $payment = Payment::factory()->create(['id' => 'PAY-1']);
        $payment->lessons()->attach($lesson->id);

        $this->assertDatabaseCount('lesson_payment', 1);

        $payment->delete();

        $this->assertDatabaseCount('lesson_payment', 0);
        $this->assertNotNull(Lesson::find($lesson->id));
    }

    public function test_deleting_buyer_preserves_pivot_between_lesson_and_payment(): void
    {
        Buyer::factory()->create(['id' => 'acme', 'name' => 'Acme']);
        $lesson = Lesson::factory()->create(['buyer_id' => 'acme']);
        $payment = Payment::factory()->create(['id' => 'PAY-1', 'buyer_id' => 'acme']);
        $payment->lessons()->attach($lesson->id);

        Buyer::find('acme')->delete();

        $this->assertDatabaseCount('lesson_payment', 1);
        $this->assertNull($lesson->fresh()->buyer_id);
        $this->assertNull($payment->fresh()->buyer_id);
    }
}
