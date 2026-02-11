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
        Schema::create('payments', function (Blueprint $table) {
            $table->string('id', 40)->primary();
            $table->dateTime('datetime');
            $table->integer('amount_gbp_pence');
            $table->string('currency', 3);
            $table->string('payment_reference', 150);
            $table->string('buyer_id', 100);
            $table->string('sequence_number', 3)->nullable();

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
        Schema::dropIfExists('payments');
    }
};
