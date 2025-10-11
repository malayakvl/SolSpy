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
            // Проверяем, существует ли столбец earned_credits, прежде чем добавлять его
            if (!Schema::hasColumn('data.validators', 'earned_credits')) {
                $table->bigInteger('earned_credits')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            // Проверяем, существует ли столбец earned_credits, прежде чем удалить его
            if (Schema::hasColumn('data.validators', 'earned_credits')) {
                $table->dropColumn('earned_credits');
            }
        });
    }
};