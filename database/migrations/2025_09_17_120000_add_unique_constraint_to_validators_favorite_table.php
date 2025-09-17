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
        Schema::table('data.validators_favorite', function (Blueprint $table) {
            // Add unique constraint on user_id and validator_id combination
            $table->unique(['user_id', 'validator_id'], 'unique_user_validator_favorite');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators_favorite', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique('unique_user_validator_favorite');
        });
    }
};