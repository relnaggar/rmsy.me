<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Mappings previously hardcoded in CalendarService.
     */
    private const PREFIX_TO_BUYER = [
        'MyTutor' => 'MYTUTORWEB LIMITED',
        'Tutorful' => 'TUTORA LTD',
        'Spires' => 'SOTC LTD',
        'TutorRecruiter' => 'TUTORCRUNCHER LTD',
        'Superprof' => 'PAYPAL',
    ];

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            $table->string('calendar_prefix', 50)->nullable()->unique();
        });

        foreach (self::PREFIX_TO_BUYER as $prefix => $buyerId) {
            DB::table('buyers')->where('id', $buyerId)->update(['calendar_prefix' => $prefix]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buyers', function (Blueprint $table) {
            $table->dropUnique(['calendar_prefix']);
            $table->dropColumn('calendar_prefix');
        });
    }
};
