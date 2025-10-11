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
            // Проверяем, существует ли столбец tvr, прежде чем добавлять его
            if (!Schema::hasColumn('data.validators', 'tvr')) {
                $table->double('tvr')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            // Проверяем, существует ли столбец tvr, прежде чем удалить его
            if (Schema::hasColumn('data.validators', 'tvr')) {
                $table->dropColumn('tvr');
            }
        });
    }
};