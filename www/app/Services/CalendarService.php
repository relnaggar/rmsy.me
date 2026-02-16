<?php

namespace App\Services;

use App\Models\Buyer;
use App\Models\Client;
use App\Models\Lesson;
use App\Models\Student;
use DateTimeImmutable;
use DateTimeInterface;
use DateTimeZone;
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
        if (
            empty(session('ms_access_token'))
            || empty(session('ms_token_expires'))
        ) {
            return false;
        }

        if (
            now()->gte(session('ms_token_expires')->subSeconds(60))
            && empty(session('ms_refresh_token'))
        ) {
            return false;
        }

        return true;
    }

    public function importLessonsFromCalendar(string $startDate, string $endDate, array $filters = []): int
    {
        $events = $this->getCalendarEvents($startDate, $endDate);
        $imported = 0;

        foreach ($events as $event) {
            $subject = $event['subject'];

            // skip events without price (unless it's a meeting)
            if (! str_contains($subject, '£')) {
                continue;
            }

            // extract source (first word before colon)
            $parts = explode(':', $subject);
            if (count($parts) < 2) {
                continue;
            }
            $firstPart = trim($parts[0]);
            $firstSubparts = explode(' ', $firstPart);
            if (count($firstSubparts) < 2) {
                continue;
            }
            $source = trim($firstSubparts[0]);

            // extract price
            if (! preg_match('/£([0-9]+(\.[0-9]{1,2})?)/', $subject, $matches)) {
                continue;
            }
            $priceGbpPence = poundsToPence(floatval($matches[1]));

            // determine student/client
            $secondPart = trim($parts[1]);
            $secondSubparts = explode(',', $secondPart);
            $studentClient = trim($secondSubparts[0]);
            $studentClientParts = explode('/', $studentClient);

            if (count($studentClientParts) < 2) {
                $name = trim($studentClientParts[0]);
                $clientName = $name;
                $studentId = $this->findOrCreateStudent($name);
                $clientId = $this->findOrCreateClient($name);
            } elseif (count($studentClientParts) === 2) {
                $studentName = trim($studentClientParts[0]);
                $clientName = trim($studentClientParts[1]);
                $studentId = $this->findOrCreateStudent($studentName);
                $clientId = $this->findOrCreateClient($clientName);
            } else {
                continue;
            }

            // determine buyer
            if ($source === 'private') {
                $buyerId = $this->findOrCreateBuyer($clientName);
            } else {
                $buyerId = self::SOURCE_TO_BUYER[$source] ?? null;
                if ($buyerId === null) {
                    continue;
                }
                Buyer::firstOrCreate(['id' => $buyerId], ['name' => $buyerId]);
            }

            // apply filters
            if (isset($filters['buyer_id']) && $buyerId !== $filters['buyer_id']) {
                continue;
            }
            if (isset($filters['student_id']) && $studentId !== $filters['student_id']) {
                continue;
            }
            if (isset($filters['client_id']) && $clientId !== $filters['client_id']) {
                continue;
            }

            // extract start time and calculate duration
            $startDateTime = $event['start']['dateTime'];
            $startDt = new DateTimeImmutable($startDateTime);
            $endDt = new DateTimeImmutable($event['end']['dateTime']);
            $durationMinutes = (int) round(
                ($endDt->getTimestamp() - $startDt->getTimestamp()) / 60
            );
            if ($durationMinutes === 60) {
                $durationMinutes = 55;
            }

            // determine if recurring
            $repeatWeeks = strtolower($event['type'] ?? '') === 'occurrence' ? 1 : 0;

            // insert lesson (ignore if datetime already exists)
            Lesson::firstOrCreate(
                ['datetime' => $startDateTime],
                [
                    'duration_minutes' => $durationMinutes,
                    'repeat_weeks' => $repeatWeeks,
                    'price_gbp_pence' => $priceGbpPence,
                    'student_id' => $studentId,
                    'client_id' => $clientId,
                    'buyer_id' => $buyerId,
                ]
            );
            $imported++;
        }

        return $imported;
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
        $accessToken = session('ms_access_token');
        $expiresAt = session('ms_token_expires');

        if (empty($accessToken) || empty($expiresAt)) {
            throw new RuntimeException('No Microsoft access token available.');
        }

        // valid if more than 60 seconds until expiry
        if (now()->lt($expiresAt->subSeconds(60))) {
            return $accessToken;
        }

        // attempt refresh
        $refreshToken = session('ms_refresh_token');
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
        session([
            'ms_access_token' => $tokens['access_token'],
            'ms_token_expires' => now()->addSeconds($tokens['expires_in']),
        ]);
        if (! empty($tokens['refresh_token'])) {
            session(['ms_refresh_token' => $tokens['refresh_token']]);
        }

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
