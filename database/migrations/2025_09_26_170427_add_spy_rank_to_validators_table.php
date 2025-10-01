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
            $table->decimal('spy_rank', 5, 2)->nullable()->after('sfdp_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('data.validators', function (Blueprint $table) {
            $table->dropColumn('spy_rank');
        });
    }
};