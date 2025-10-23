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
            $table->decimal('epoch_completed_percent', 5, 2)->default(0.00)->after('ephoch');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.settings', function (Blueprint $table) {
            $table->dropColumn('epoch_completed_percent');
        });
    }
};