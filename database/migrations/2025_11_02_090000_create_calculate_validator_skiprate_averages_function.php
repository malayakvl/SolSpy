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
        CREATE OR REPLACE FUNCTION data.calculate_validator_skiprate_averages(
            validator_key TEXT,
            epochs_count INTEGER
        )
        RETURNS TABLE(
            epoch INTEGER,
            avg_skip_rate DOUBLE PRECISION
        ) AS $$
        BEGIN
            RETURN QUERY
            SELECT 
                vs.epoch,
                AVG(CAST(vs.skip_rate AS DOUBLE PRECISION)) AS avg_skip_rate
            FROM data.validator_skiprate vs
            WHERE (vs.vote_pubkey = validator_key OR vs.node_pubkey = validator_key)
                AND vs.epoch >= (SELECT MAX(data.validator_skiprate.epoch) FROM data.validator_skiprate) - epochs_count + 1
            GROUP BY vs.epoch
            ORDER BY vs.epoch;
        END;
        $$ LANGUAGE plpgsql;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP FUNCTION IF EXISTS data.calculate_validator_skiprate_averages(TEXT, INTEGER);');
    }
};