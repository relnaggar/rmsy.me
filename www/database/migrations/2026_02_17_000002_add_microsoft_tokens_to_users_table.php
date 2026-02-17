<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('ms_access_token')->nullable();
            $table->text('ms_refresh_token')->nullable();
            $table->datetime('ms_token_expires')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ms_access_token', 'ms_refresh_token', 'ms_token_expires']);
        });
    }
};
