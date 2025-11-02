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
        //
        Schema::create('data.validator_skiprate', function (Blueprint $table) {
            $table->id();
            $table->string('vote_pubkey');
            $table->integer('epoch');
            $table->integer('total_slots');
            $table->integer('produced');
            $table->integer('skipped');
            $table->decimal('skip_rate', 5,2);
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('data.validator_skiprate');
    }
};
