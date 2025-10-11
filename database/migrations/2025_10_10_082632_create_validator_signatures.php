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
        Schema::create('validator_signatures', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('vote_pubkey', 44);
            $table->string('signature', 88);
            $table->bigInteger('slot');
            $table->bigInteger('block_time')->nullable();
            $table->string('err')->nullable();
            $table->timestamps();
            $table->index('vote_pubkey');
            $table->index('slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data.validator_signatures');
    }
};
