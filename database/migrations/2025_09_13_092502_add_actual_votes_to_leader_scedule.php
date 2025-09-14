<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('data.leader_schedule', function (Blueprint $table) {
            $table->integer('actual_votes')->nullable()->after('slots');
        });
    }

    public function down()
    {
        Schema::table('data.leader_schedule', function (Blueprint $table) {
            $table->dropColumn('actual_votes');
        });
    }
};
