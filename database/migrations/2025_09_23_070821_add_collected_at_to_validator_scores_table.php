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
        Schema::table('data.validator_scores', function (Blueprint $table) {
            //
            $table->timestamp('collected_at')->useCurrent()->after('stake_percent');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validator_scores', function (Blueprint $table) {
            //
            $table->dropColumn('collected_at');
        });
    }
};
