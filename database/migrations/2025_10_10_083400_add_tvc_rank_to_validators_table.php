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
            // Проверяем, существует ли столбец tvc_rank, прежде чем добавлять его
            if (!Schema::hasColumn('data.validators', 'tvc_rank')) {
                $table->bigInteger('tvc_rank')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            // Проверяем, существует ли столбец tvc_rank, прежде чем удалить его
            if (Schema::hasColumn('data.validators', 'tvc_rank')) {
                $table->dropColumn('tvc_rank');
            }
        });
    }
};