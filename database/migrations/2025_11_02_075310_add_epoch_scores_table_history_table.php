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
        Schema::create('data.validator_scores_history', function (Blueprint $table) {
            $table->id();
            $table->integer('epoch');
            $table->integer('rank');
            $table->string('vote_pubkey', 44);
            $table->string('node_pubkey', 44);
            $table->string('uptime', 10);
            $table->bigInteger('root_slot');
            $table->bigInteger('vote_slot');
            $table->decimal('commission', 5, 2);
            $table->bigInteger('credits');
            $table->string('version', 20);
            $table->decimal('stake', 20, 9);
            $table->decimal('stake_percent', 5, 2);
            $table->timestamp('collected_at');
            $table->timestamps();
            
            $table->index('vote_pubkey');
            $table->index('node_pubkey');
            $table->index('rank');
            $table->index('credits');
            $table->index('collected_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::dropIfExists('data.validator_scores_history');

    }
};