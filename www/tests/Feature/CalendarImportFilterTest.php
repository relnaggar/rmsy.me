<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Lesson;
use App\Models\Student;
use App\Services\CalendarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CalendarImportFilterTest extends TestCase
{
    use RefreshDatabase;

    private function makeEvents(): array
    {
        return [
            [
                'subject' => 'MyTutor 55: Alice/ClientA, Mon 10am £25',
                'start' => ['dateTime' => '2025-03-01T10:00:00'],
                'end' => ['dateTime' => '2025-03-01T10:55:00'],
                'type' => 'singleInstance',
            ],
            [
                'subject' => 'Tutorful 55: Bob/ClientB, Tue 11am £30',
                'start' => ['dateTime' => '2025-03-02T11:00:00'],
                'end' => ['dateTime' => '2025-03-02T11:55:00'],
                'type' => 'singleInstance',
            ],
            [
                'subject' => 'private 55: Charlie/ClientA, Wed 2pm £20',
                'start' => ['dateTime' => '2025-03-03T14:00:00'],
                'end' => ['dateTime' => '2025-03-03T14:55:00'],
                'type' => 'singleInstance',
            ],
        ];
    }

    private function createServiceWithFakeEvents(array $events): CalendarService
    {
        return new class ($events) extends CalendarService {
            public function __construct(private readonly array $fakeEvents)
            {
            }

            protected function getCalendarEvents(string $startDate, string $endDate): array
            {
                return $this->fakeEvents;
            }
        };
    }

    public function test_import_without_filters_imports_all(): void
    {
        $service = $this->createServiceWithFakeEvents($this->makeEvents());

        $imported = $service->importLessonsFromCalendar('2025-03-01', '2025-03-31');

        $this->assertEquals(3, $imported['imported']);
        $this->assertEquals(3, Lesson::count());
    }

    public function test_import_filter_by_buyer(): void
    {
        $service = $this->createServiceWithFakeEvents($this->makeEvents());

        $imported = $service->importLessonsFromCalendar('2025-03-01', '2025-03-31', [
            'buyer_id' => 'MYTUTORWEB LIMITED',
        ]);

        $this->assertEquals(1, $imported['imported']);
        $this->assertEquals(1, Lesson::count());
        $this->assertEquals('MYTUTORWEB LIMITED', Lesson::first()->buyer_id);
    }

    public function test_import_filter_by_student(): void
    {
        // First import all to create students
        $service = $this->createServiceWithFakeEvents($this->makeEvents());
        $service->importLessonsFromCalendar('2025-03-01', '2025-03-31');
        $bobId = Student::where('name', 'Bob')->first()->id;
        Lesson::query()->delete();

        // Reimport with filter
        $service = $this->createServiceWithFakeEvents($this->makeEvents());
        $imported = $service->importLessonsFromCalendar('2025-03-01', '2025-03-31', [
            'student_id' => $bobId,
        ]);

        $this->assertEquals(1, $imported['imported']);
        $this->assertEquals(1, Lesson::count());
        $this->assertEquals($bobId, Lesson::first()->student_id);
    }

    public function test_import_filter_by_client(): void
    {
        // First import all to create clients
        $service = $this->createServiceWithFakeEvents($this->makeEvents());
        $service->importLessonsFromCalendar('2025-03-01', '2025-03-31');
        $clientAId = Client::where('name', 'ClientA')->first()->id;
        Lesson::query()->delete();

        // Reimport with filter — ClientA appears in events 1 and 3
        $service = $this->createServiceWithFakeEvents($this->makeEvents());
        $imported = $service->importLessonsFromCalendar('2025-03-01', '2025-03-31', [
            'client_id' => $clientAId,
        ]);

        $this->assertEquals(2, $imported['imported']);
        $this->assertEquals(2, Lesson::count());
        $this->assertTrue(Lesson::get()->every(fn ($l) => $l->client_id === $clientAId));
    }

    public function test_import_skips_already_imported_lessons(): void
    {
        $service = $this->createServiceWithFakeEvents($this->makeEvents());

        $first = $service->importLessonsFromCalendar('2025-03-01', '2025-03-31');
        $this->assertEquals(3, $first['imported']);
        $this->assertEquals(0, $first['skipped']);

        $service = $this->createServiceWithFakeEvents($this->makeEvents());
        $second = $service->importLessonsFromCalendar('2025-03-01', '2025-03-31');
        $this->assertEquals(0, $second['imported']);
        $this->assertEquals(3, $second['skipped']);
        $this->assertEquals(3, Lesson::count());
    }

    public function test_import_converts_utc_graph_event_to_uk_time(): void
    {
        // Microsoft Graph default: 'UTC' timezone, 13:00 UTC = 14:00 London BST in June.
        $events = [
            [
                'subject' => 'MyTutor 55: Alice/ClientA, Sun 2pm £25',
                'start' => ['dateTime' => '2025-06-15T13:00:00', 'timeZone' => 'UTC'],
                'end' => ['dateTime' => '2025-06-15T13:55:00', 'timeZone' => 'UTC'],
                'type' => 'singleInstance',
            ],
        ];

        $service = $this->createServiceWithFakeEvents($events);
        $result = $service->importLessonsFromCalendar('2025-06-01', '2025-06-30');

        $this->assertSame(1, $result['imported']);

        $lesson = Lesson::first();
        $this->assertSame('2025-06-15 14:00', $lesson->datetime->format('Y-m-d H:i'));
        $this->assertSame('Europe/London', $lesson->datetime->getTimezone()->getName());

        // Stored value on disk is naive London wallclock.
        $raw = \DB::table('lessons')->where('id', $lesson->id)->value('datetime');
        $this->assertSame('2025-06-15 14:00:00', $raw);
    }

    public function test_import_winter_event_keeps_same_hour_as_utc(): void
    {
        $events = [
            [
                'subject' => 'MyTutor 55: Alice/ClientA, Wed 2pm £25',
                'start' => ['dateTime' => '2025-01-15T14:00:00', 'timeZone' => 'UTC'],
                'end' => ['dateTime' => '2025-01-15T14:55:00', 'timeZone' => 'UTC'],
                'type' => 'singleInstance',
            ],
        ];

        $service = $this->createServiceWithFakeEvents($events);
        $service->importLessonsFromCalendar('2025-01-01', '2025-01-31');

        $this->assertSame('2025-01-15 14:00', Lesson::first()->datetime->format('Y-m-d H:i'));
    }

    public function test_import_filter_by_multiple_criteria(): void
    {
        // First import all to create records
        $service = $this->createServiceWithFakeEvents($this->makeEvents());
        $service->importLessonsFromCalendar('2025-03-01', '2025-03-31');
        $clientAId = Client::where('name', 'ClientA')->first()->id;
        Lesson::query()->delete();

        // Reimport with buyer + client filter
        // Only Alice's lesson matches both buyer=MYTUTORWEB LIMITED and client=ClientA
        $service = $this->createServiceWithFakeEvents($this->makeEvents());
        $imported = $service->importLessonsFromCalendar('2025-03-01', '2025-03-31', [
            'buyer_id' => 'MYTUTORWEB LIMITED',
            'client_id' => $clientAId,
        ]);

        $this->assertEquals(1, $imported['imported']);
        $this->assertEquals(1, Lesson::count());
    }
}
