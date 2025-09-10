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
        //
        Schema::table('data.validators', function($table) {
            $table->bigInteger('rank')->nullable();
            $table->bigInteger('last_vote')->nullable();
            $table->bigInteger('root_slot')->nullable();
            $table->bigInteger('credits')->nullable();
            $table->bigInteger('epoch_credits_stakewidth')->nullable();
            $table->float('activated_stake')->nullable();
            $table->string('version')->nullable();
            $table->integer('skip_rate')->nullable();
            $table->integer('first_epoch_with_stake')->nullable();
            $table->string('ip_city')->nullable();
            $table->string('ip_country')->nullable();
            $table->string('ip_asn')->nullable();
            $table->string('ip_org')->nullable();
            $table->boolean('is_jito')->default(false);
            $table->boolean('jito_commission_bps')->default(false);
            $table->float('vote_success')->nullable();
            $table->float('vote_success_score')->nullable();
            $table->float('skip_rate_score')->nullable();
            $table->float('info_score')->nullable();
            $table->float('commission_score')->nullable();
            $table->float('first_epoch_distance')->nullable();
            $table->float('epoch_distance_score')->nullable();
            $table->float('stake_weight')->nullable();
            $table->float('stake_weight_score')->nullable();
            $table->string('asn')->nullable();
            $table->float('stake_ratio')->nullable();
            $table->float('credit_ratio')->nullable();
            $table->float('apy_estimate')->nullable();
            $table->float('staking_apy')->nullable();
            $table->float('jito_apy')->nullable();
            $table->float('total_apy')->nullable();
            $table->float('uptime')->nullable();
            $table->float('uptime_score')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
        Schema::table('data.validators', function($table) {
            $table->dropColumn('rank');
            $table->dropColumn('last_vote');
            $table->dropColumn('root_slot');
            $table->dropColumn('credits');
            $table->dropColumn('epoch_credits');
            $table->dropColumn('activated_stake');
            $table->dropColumn('version');
            $table->dropColumn('skip_rate');
            $table->dropColumn('first_epoch_with_stake');
            $table->dropColumn('ip_city');
            $table->dropColumn('ip_country');
            $table->dropColumn('ip_asn');
            $table->dropColumn('ip_org');
            $table->dropColumn('is_jito');
            $table->dropColumn('jito_commission_bps');
            $table->dropColumn('vote_success');
            $table->dropColumn('vote_success_score');
            $table->dropColumn('skip_rate_score');
            $table->dropColumn('info_score');
            $table->dropColumn('commission_score');
            $table->dropColumn('first_epoch_distance');
            $table->dropColumn('epoch_distance_score');
            $table->dropColumn('stake_weight');
            $table->dropColumn('stake_weight_score');
            $table->dropColumn('asn');
            $table->dropColumn('stake_ratio');
            $table->dropColumn('credit_ratio');
            $table->dropColumn('apy_estimate');
            $table->dropColumn('staking_apy');
            $table->dropColumn('jito_apy');
            $table->dropColumn('total_apy');
            $table->dropColumn('uptime');
            $table->dropColumn('uptime_score');


            $table->dropColumn('avatar');
            $table->dropColumn('provider');
        });
    }
};
