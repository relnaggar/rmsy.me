<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lesson_payment', function (Blueprint $table) {
            $table->foreignId('lesson_id')->constrained('lessons')->onDelete('cascade');
            $table->string('payment_id', 40);

            $table->foreign('payment_id')
                ->references('id')
                ->on('payments')
                ->onDelete('cascade');

            $table->primary(['lesson_id', 'payment_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_payment');
    }
};
