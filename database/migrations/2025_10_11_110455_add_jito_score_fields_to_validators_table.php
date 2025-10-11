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
         Schema::table('data.validators', function (Blueprint $table) {
            $table->double('vote_credit_ratio')->nullable();
            $table->double('yield_score')->nullable();
            $table->double('jito_score')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            $table->dropColumn(['vote_credit_ratio', 'yield_score', 'jito_score']);
        });
    }
};
