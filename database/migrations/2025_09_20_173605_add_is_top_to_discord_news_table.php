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
        Schema::table('data.discord_news', function (Blueprint $table) {
            $table->boolean('is_top')->default(false)->after('sort_order');
            $table->index('is_top'); // Index for is_top queries
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.discord_news', function (Blueprint $table) {
            $table->dropIndex(['is_top']);
            $table->dropColumn('is_top');
        });
    }
};