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
        Schema::create('data.stake_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('epoch');
            $table->string('stake_pubkey')->unique()->index();
            $table->string('vote_pubkey')->index();
            $table->string('node_pubkey')->index();
            $table->bigInteger('lamports');
            $table->boolean('is_self_stake')->default(false);
            $table->timestamps();
            
            // Add index for epoch for better query performance
            $table->index('epoch');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data.stake_accounts');
    }
};