<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['buyer_id']);
            $table->string('buyer_id', 100)->nullable()->change();
            $table->foreign('buyer_id')
                ->references('id')
                ->on('buyers')
                ->onDelete('set null')
                ->onUpdate('no action');
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropForeign(['buyer_id']);
            $table->foreign('buyer_id')
                ->references('id')
                ->on('buyers')
                ->onDelete('set null')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['buyer_id']);
            $table->string('buyer_id', 100)->nullable(false)->change();
            $table->foreign('buyer_id')
                ->references('id')
                ->on('buyers')
                ->onDelete('no action')
                ->onUpdate('no action');
        });

        Schema::table('lessons', function (Blueprint $table) {
            $table->dropForeign(['buyer_id']);
            $table->foreign('buyer_id')
                ->references('id')
                ->on('buyers')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }
};
