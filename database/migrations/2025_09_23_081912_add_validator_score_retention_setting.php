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
        Schema::table('data.settings', function (Blueprint $table) {
            //
            $table->integer('collect_score_retention')->default(10);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('data.settings', function (Blueprint $table) {
            //
            $table->dropColumn('collect_score_retention');
        });
    }
};
