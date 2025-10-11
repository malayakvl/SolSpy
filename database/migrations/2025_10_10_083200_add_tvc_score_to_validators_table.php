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
            // Проверяем, существует ли столбец tvc_score, прежде чем добавлять его
            if (!Schema::hasColumn('data.validators', 'tvc_score')) {
                $table->double('tvc_score')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            // Проверяем, существует ли столбец tvc_score, прежде чем удалить его
            if (Schema::hasColumn('data.validators', 'tvc_score')) {
                $table->dropColumn('tvc_score');
            }
        });
    }
};