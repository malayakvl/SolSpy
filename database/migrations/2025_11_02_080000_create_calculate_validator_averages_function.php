<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared('
        CREATE OR REPLACE FUNCTION data.calculate_validator_averages(
            validator_key TEXT,
            epochs_count INTEGER
        )
        RETURNS TABLE(
            epoch INTEGER,
            avg_uptime DOUBLE PRECISION,
            avg_root_slot DOUBLE PRECISION,
            avg_stake DOUBLE PRECISION,
            avg_commission DOUBLE PRECISION
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                vsh.epoch,
                AVG(CAST(REPLACE(vsh.uptime, \'%\', \'\') AS DOUBLE PRECISION)) AS avg_uptime,
                AVG(CAST(vsh.root_slot AS DOUBLE PRECISION)) AS avg_root_slot,
                AVG(CAST(vsh.stake AS DOUBLE PRECISION)) AS avg_stake,
                AVG(CAST(vsh.commission AS DOUBLE PRECISION)) AS avg_commission
            FROM data.validator_scores_history vsh
            WHERE (vsh.vote_pubkey = validator_key OR vsh.node_pubkey = validator_key)
                AND vsh.epoch >= (SELECT MAX(data.validator_scores_history.epoch) FROM data.validator_scores_history) - epochs_count + 1
            GROUP BY vsh.epoch
            ORDER BY vsh.epoch;
        END;
        $$ LANGUAGE plpgsql;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP FUNCTION IF EXISTS data.calculate_validator_averages(TEXT, INTEGER);');
    }
};