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
        Schema::table('settings', function($table) {
            $table->bigInteger('absolute_slot')->nullable();
            $table->bigInteger('block_height')->nullable();
            $table->bigInteger('epoch')->nullable();
            $table->bigInteger('slot_index')->nullable();
            $table->bigInteger('slot_in_epoch')->nullable();
            $table->bigInteger('transaction_count')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('settings', function($table) {
            $table->dropColumn('absolute_slot');
            $table->dropColumn('block_height');
            $table->dropColumn('epoch');
            $table->dropColumn('slot_index');
            $table->dropColumn('slot_in_epoch');
            $table->dropColumn('transaction_count');
        });
    }
};
