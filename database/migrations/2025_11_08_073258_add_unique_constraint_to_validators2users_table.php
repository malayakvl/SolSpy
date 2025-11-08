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
        Schema::table('data.validators2users', function (Blueprint $table) {
            $table->unique(['user_id', 'validator_id', 'type'], 'validators2users_unique_user_validator_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators2users', function (Blueprint $table) {
            $table->dropUnique('validators2users_unique_user_validator_type');
        });
    }
};