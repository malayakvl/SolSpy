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
        Schema::table('data.settings', function (Blueprint $table) {
            $table->string('epoch_completed_time', 100)->default('')->after('epoch_completed_percent');
            $table->string('epoch_total_time', 100)->default('')->after('epoch_completed_time');
            $table->string('epoch_remaining_time', 100)->default('')->after('epoch_total_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.settings', function (Blueprint $table) {
            $table->dropColumn(['epoch_completed_time', 'epoch_total_time', 'epoch_remaining_time']);
        });
    }
};