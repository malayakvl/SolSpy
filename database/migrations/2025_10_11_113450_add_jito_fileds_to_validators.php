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
            $table->double('jiito_score')->nullable()->after('tvc_score');
            $table->double('jiito_score_voter')->nullable()->after('jiito_score');
            $table->double('jiito_score_validator')->nullable()->after('jiito_score_voter');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            $table->dropColumn(['jiito_score', 'jiito_score_voter', 'jiito_score_validator']);
        });
    }
};
