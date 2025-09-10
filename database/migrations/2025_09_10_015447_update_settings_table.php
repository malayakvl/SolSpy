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
            // Add new columns
            $table->integer('update_interval')->default(2);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('data.settings', function (Blueprint $table) {
            $table->dropColumn(['update_interval']);
            // $table->integer('update_interval')->default(2)->after('author');
        });
    }
};
