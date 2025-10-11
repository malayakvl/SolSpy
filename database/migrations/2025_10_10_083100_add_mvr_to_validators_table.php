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
            // Проверяем, существует ли столбец mvr, прежде чем добавлять его
            if (!Schema::hasColumn('data.validators', 'mvr')) {
                $table->double('mvr')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            // Проверяем, существует ли столбец mvr, прежде чем удалить его
            if (Schema::hasColumn('data.validators', 'mvr')) {
                $table->dropColumn('mvr');
            }
        });
    }
};