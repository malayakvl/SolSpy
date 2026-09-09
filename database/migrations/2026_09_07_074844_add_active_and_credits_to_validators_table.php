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
            // Прапорець активності (чи заробила нода кредити в поточній епосі)
            $table->boolean('active')->default(false)->after('delinquent');

            // Кількість кредитів за поточну епоху
            $table->unsignedBigInteger('credits_current_epoch')->default(0)->after('active');

            // Індекси для швидкої фільтрації та сортування на дашборді
            $table->index('active');
            $table->index(['active', 'credits_current_epoch']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            $table->dropIndex(['active', 'credits_current_epoch']);
            $table->dropIndex(['active']);

            $table->dropColumn(['active', 'credits_current_epoch']);
        });
    }
};