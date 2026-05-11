<?php

declare(strict_types=1);

use App\Models\Lesson;
use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class () extends Migration {
    public function up(): void
    {
        DB::table('lessons')->orderBy('id')->lazy()->each(function ($lesson) {
            $converted = Carbon::parse($lesson->datetime, 'UTC')
                ->setTimezone(Lesson::TIMEZONE)
                ->format('Y-m-d H:i:s');

            DB::table('lessons')
                ->where('id', $lesson->id)
                ->update(['datetime' => $converted]);
        });
    }

    public function down(): void
    {
        DB::table('lessons')->orderBy('id')->lazy()->each(function ($lesson) {
            $converted = Carbon::parse($lesson->datetime, Lesson::TIMEZONE)
                ->setTimezone('UTC')
                ->format('Y-m-d H:i:s');

            DB::table('lessons')
                ->where('id', $lesson->id)
                ->update(['datetime' => $converted]);
        });
    }
};
