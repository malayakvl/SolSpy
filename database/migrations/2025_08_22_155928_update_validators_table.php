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
        Schema::table('validators', function($table) {
            $table->string('keybase_id')->nullable();
            $table->string('www_url')->nullable();
            $table->text('details')->nullable();
            $table->string('active_stake')->nullable();
            $table->float('commission')->nullable();
            $table->float('data_center_concentration_score')->nullable();
            $table->boolean('delinquent')->default(false);
            $table->float('published_information_score')->nullable();
            $table->float('root_distance_score')->nullable();
            $table->float('security_report_score')->nullable();
            $table->float('skipped_slot_score')->nullable();
            $table->float('skipped_after_score')->nullable();
            $table->string('software_version')->nullable();
            $table->string('software_version_score')->nullable();
            $table->float('stake_concentration_score')->nullable();
            $table->float('consensus_mods_score')->nullable();
            $table->float('vote_latency_score')->nullable();
            $table->float('total_score')->nullable();
            $table->float('vote_distance_score')->nullable();
            $table->string('software_client')->nullable();
            $table->float('software_client_id')->nullable();
            $table->string('ip')->nullable();
            $table->string('data_center_key')->nullable();
            $table->string('autonomous_system_number')->nullable();
            $table->float('latitude')->nullable();
            $table->float('longitude')->nullable();
            $table->string('data_center_host')->nullable();
            $table->string('epoch_credits')->nullable();
            $table->string('epoch')->nullable();
            $table->float('skipped_slots')->nullable();
            $table->float('skipped_slot_percent')->nullable();
            $table->float('ping_time')->nullable();
            $table->string('url')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('data.validators', function($table) {
            $table->dropColumn('keybase_id');
            $table->dropColumn('www_url');
            $table->dropColumn('avatar_file_url');
            $table->dropColumn('details');
            $table->dropColumn('active_stake');
            $table->dropColumn('commission');
            $table->dropColumn('data_center_concentration_score');
            $table->dropColumn('delinquent');
            $table->dropColumn('published_information_score');
            $table->dropColumn('root_distance_score');
            $table->dropColumn('security_report_score');
            $table->dropColumn('skipped_slot_score');
            $table->dropColumn('skipped_after_score');
            $table->dropColumn('software_version');
            $table->dropColumn('software_version_score');
            $table->dropColumn('stake_concentration_score');
            $table->dropColumn('consensus_mods_score');
            $table->dropColumn('vote_latency_score');
            $table->dropColumn('total_score');
            $table->dropColumn('vote_distance_score');
            $table->dropColumn('software_client');
            $table->dropColumn('software_client_id');
            $table->dropColumn('ip');
            $table->dropColumn('data_center_key');
            $table->dropColumn('autonomous_system_number');
            $table->dropColumn('latitude');
            $table->dropColumn('longitude');
            $table->dropColumn('data_center_host');
            $table->dropColumn('epoch_credits');
            $table->dropColumn('epoch');
            $table->dropColumn('skipped_slots');
            $table->dropColumn('skipped_slot_percent');
            $table->dropColumn('ping_time');
            $table->dropColumn('url');
        });
    }
};
