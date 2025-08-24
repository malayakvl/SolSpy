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
        Schema::table('validators', function($table) {
            $table->dropColumn('v_key');
            $table->dropColumn('vote_score');

            $table->string('node_pubkey')->unique()->index();
            $table->string('vote_pubkey')->unique()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
