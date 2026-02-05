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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->string('description', 255)->default('Online computer science classes');
            $table->dateTime('datetime')->unique();
            $table->integer('duration_minutes')->default(55);
            $table->integer('repeat_weeks')->default(0);
            $table->integer('price_gbp_pence');
            $table->boolean('paid')->default(false);
            $table->foreignId('student_id')->nullable()->constrained('students')->onDelete('no action')->onUpdate('no action');
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('no action')->onUpdate('no action');
            $table->string('buyer_id', 100)->nullable();

            $table->foreign('buyer_id')
                ->references('id')
                ->on('buyers')
                ->onDelete('no action')
                ->onUpdate('no action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
