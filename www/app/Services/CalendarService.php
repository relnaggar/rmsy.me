<?php

declare(strict_types=1);

namespace App\Services;

use App\Data\CalendarEvent;
use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use DateTimeImmutable;
use DateTimeInterface;
use DateTimeZone;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CalendarService
{
    private const SOURCE_TO_BUYER = [
        'MyTutor' => 'MYTUTORWEB LIMITED',
        'Tutorful' => 'TUTORA LTD',
        'Spires' => 'SOTC LTD',
        'TutorRecruiter' => 'TUTORCRUNCHER LTD',
        'Superprof' => 'PAYPAL',
    ];

    public function isAuthorised(): bool
    {
        $user = auth()->user();
        if (! $user instanceof User) {
            return false;
        }

        if (empty($user->ms_access_token) || empty($user->ms_token_expires)) {
            return false;
        }

        if (
            now()->gte($user->ms_token_expires->copy()->subSeconds(60))
            && empty($user->ms_refresh_token)
        ) {
            return false;
        }

        return true;
    }

    /**
     * @return array{imported: int, skipped: int}
     */
    public function importLessonsFromCalendar(string $startDate, string $endDate, array $filters = []): array
    {
        $rawEvents = $this->getCalendarEvents($startDate, $endDate);
        $imported = 0;
        $skipped = 0;

        foreach ($rawEvents as $raw) {
            $event = $this->parseEvent($raw);
            if ($event === null) {
                continue;
            }

            $result = $this->persistEvent($event, $filters);
            if ($result === self::PERSIST_FILTERED) {
                continue;
            }

            if ($result === self::PERSIST_CREATED) {
                $imported++;
            } else {
                $skipped++;
            }
        }

        return ['imported' => $imported, 'skipped' => $skipped];
    }

    private const PERSIST_CREATED = 1;
    private const PERSIST_SKIPPED = 2;
    private const PERSIST_FILTERED = 3;

    private function parseEvent(array $raw): ?CalendarEvent
    {
        $subject = $raw['subject'] ?? '';

        if (! str_contains($subject, '£')) {
            return null;
        }

        $parts = explode(':', $subject);
        if (count($parts) < 2) {
            return null;
        }
        $firstPart = trim($parts[0]);
        $firstSubparts = explode(' ', $firstPart);
        if (count($firstSubparts) < 2) {
            return null;
        }
        $source = trim($firstSubparts[0]);

        if (! preg_match('/£([0-9]+(\.[0-9]{1,2})?)/', $subject, $matches)) {
            return null;
        }
        $priceGbpPence = poundsToPence(floatval($matches[1]));

        $secondPart = trim($parts[1]);
        $secondSubparts = explode(',', $secondPart);
        $studentClient = trim($secondSubparts[0]);
        $studentClientParts = explode('/', $studentClient);

        if (count($studentClientParts) === 1) {
            $studentName = trim($studentClientParts[0]);
            $clientName = $studentName;
        } elseif (count($studentClientParts) === 2) {
            $studentName = trim($studentClientParts[0]);
            $clientName = trim($studentClientParts[1]);
        } else {
            return null;
        }

        $startTz = $raw['start']['timeZone'] ?? 'UTC';
        $endTz = $raw['end']['timeZone'] ?? 'UTC';
        $startDt = Carbon::parse($raw['start']['dateTime'], $startTz)->setTimezone(Lesson::TIMEZONE);
        $endDt = Carbon::parse($raw['end']['dateTime'], $endTz);

        $durationMinutes = (int) round(($endDt->getTimestamp() - $startDt->getTimestamp()) / 60);
        if ($durationMinutes === 60) {
            $durationMinutes = 55;
        }

        $repeatWeeks = strtolower($raw['type'] ?? '') === 'occurrence' ? 1 : 0;

        return new CalendarEvent(
            startDatetime: $startDt,
            durationMinutes: $durationMinutes,
            repeatWeeks: $repeatWeeks,
            priceGbpPence: $priceGbpPence,
            source: $source,
            studentName: $studentName,
            clientName: $clientName,
        );
    }

    private function persistEvent(CalendarEvent $event, array $filters): int
    {
        $studentId = $this->findOrCreateStudent($event->studentName);
        $clientId = $this->findOrCreateClient($event->clientName);

        if ($event->source === 'private') {
            $buyerId = $this->findOrCreateBuyer($event->clientName);
        } else {
            $buyerId = self::SOURCE_TO_BUYER[$event->source] ?? null;
            if ($buyerId === null) {
                return self::PERSIST_FILTERED;
            }
            Buyer::firstOrCreate(['id' => $buyerId], ['name' => $buyerId]);
        }

        if (isset($filters['buyer_id']) && $buyerId !== $filters['buyer_id']) {
            return self::PERSIST_FILTERED;
        }
        if (isset($filters['student_id']) && $studentId !== $filters['student_id']) {
            return self::PERSIST_FILTERED;
        }
        if (isset($filters['client_id']) && $clientId !== $filters['client_id']) {
            return self::PERSIST_FILTERED;
        }

        try {
            $lesson = Lesson::firstOrCreate(
                ['datetime' => $event->startDatetime],
                [
                    'duration_minutes' => $event->durationMinutes,
                    'repeat_weeks' => $event->repeatWeeks,
                    'price_gbp_pence' => $event->priceGbpPence,
                    'student_id' => $studentId,
                    'client_id' => $clientId,
                    'buyer_id' => $buyerId,
                ]
            );

            return $lesson->wasRecentlyCreated ? self::PERSIST_CREATED : self::PERSIST_SKIPPED;
        } catch (UniqueConstraintViolationException) {
            return self::PERSIST_SKIPPED;
        }
    }

    private function findOrCreateStudent(string $name): int
    {
        $existing = Student::whereRaw('name LIKE ?', [$name.'%'])->first();
        if ($existing) {
            return $existing->id;
        }

        return Student::create(['name' => $name])->id;
    }

    private function findOrCreateClient(string $name): int
    {
        $existing = Client::whereRaw('name LIKE ?', [$name.'%'])->first();
        if ($existing) {
            return $existing->id;
        }

        return Client::create(['name' => $name])->id;
    }

    private function findOrCreateBuyer(string $clientName): string
    {
        $name = mb_substr($clientName, 0, 100);

        $existing = Buyer::whereRaw('name LIKE ?', [$name.'%'])->first();
        if ($existing) {
            return $existing->id;
        }

        return Buyer::create(['id' => $name, 'name' => $name])->id;
    }

    private function ensureAccessToken(): string
    {
        $user = auth()->user();
        if (! $user instanceof User) {
            throw new RuntimeException('No authenticated user.');
        }

        $accessToken = $user->ms_access_token;
        $expiresAt = $user->ms_token_expires;

        if (empty($accessToken) || empty($expiresAt)) {
            throw new RuntimeException('No Microsoft access token available.');
        }

        // valid if more than 60 seconds until expiry
        if (now()->lt($expiresAt->copy()->subSeconds(60))) {
            return $accessToken;
        }

        // attempt refresh
        $refreshToken = $user->ms_refresh_token;
        if (empty($refreshToken)) {
            throw new RuntimeException('Microsoft access token expired and no refresh token available.');
        }

        $tenant = config('services.microsoft.tenant', 'consumers');
        $authority = "https://login.microsoftonline.com/{$tenant}/oauth2/v2.0";

        $response = Http::asForm()->post("{$authority}/token", [
            'client_id' => config('services.microsoft.client_id'),
            'client_secret' => config('services.microsoft.client_secret'),
            'grant_type' => 'refresh_token',
            'refresh_token' => $refreshToken,
            'redirect_uri' => config('services.microsoft.redirect_uri'),
            'scope' => 'offline_access Calendars.Read',
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Failed to refresh Microsoft access token.');
        }

        $tokens = $response->json();
        $user->update([
            'ms_access_token' => $tokens['access_token'],
            'ms_token_expires' => now()->addSeconds($tokens['expires_in']),
            'ms_refresh_token' => $tokens['refresh_token'] ?? $user->ms_refresh_token,
        ]);

        return $tokens['access_token'];
    }

    private function getCalendarId(string $calendarName): string
    {
        $cachedId = session('ms_calendar_id');
        if (! empty($cachedId)) {
            return $cachedId;
        }

        $accessToken = $this->ensureAccessToken();
        $response = Http::withToken($accessToken)
            ->get('https://graph.microsoft.com/v1.0/me/calendars', [
                '$select' => 'id,name',
            ]);

        $calendars = $response->json('value', []);
        foreach ($calendars as $calendar) {
            if ($calendar['name'] === $calendarName) {
                session(['ms_calendar_id' => $calendar['id']]);

                return $calendar['id'];
            }
        }

        throw new RuntimeException("Calendar '{$calendarName}' not found.");
    }

    protected function getCalendarEvents(string $startDate, string $endDate): array
    {
        $accessToken = $this->ensureAccessToken();
        $calendarId = $this->getCalendarId('Tutoring');

        $start = (new DateTimeImmutable($startDate, new DateTimeZone('UTC')))
            ->format(DateTimeInterface::ATOM);
        $end = (new DateTimeImmutable($endDate.' 23:59:59', new DateTimeZone('UTC')))
            ->format(DateTimeInterface::ATOM);

        $endpoint = "https://graph.microsoft.com/v1.0/me/calendars/{$calendarId}/calendarView";

        $response = Http::withToken($accessToken)->get($endpoint, [
            'startDateTime' => $start,
            'endDateTime' => $end,
            '$top' => 1000,
            '$orderby' => 'start/dateTime desc',
            '$select' => 'subject,start,end,type',
        ]);

        return $response->json('value', []);
    }
}
