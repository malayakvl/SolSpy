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
        DB::statement("
            CREATE OR REPLACE FUNCTION data.insert_validator_scores(scores_data jsonb)
            RETURNS integer
            LANGUAGE plpgsql
            AS $$
            DECLARE
                inserted_count integer;
            BEGIN
                INSERT INTO data.validator_scores (
                    rank,
                    vote_pubkey,
                    node_pubkey,
                    uptime,
                    root_slot,
                    vote_slot,
                    commission,
                    credits,
                    version,
                    stake,
                    stake_percent,
                    collected_at,
                    created_at,
                    updated_at
                )
                SELECT 
                    (score->>'rank')::integer,
                    score->>'vote_pubkey',
                    score->>'node_pubkey',
                    score->>'uptime',
                    (score->>'root_slot')::bigint,
                    (score->>'vote_slot')::bigint,
                    (score->>'commission')::decimal(5,2),
                    (score->>'credits')::bigint,
                    score->>'version',
                    (score->>'stake')::decimal(20,9),
                    (score->>'stake_percent')::decimal(5,2),
                    (score->>'collected_at')::timestamp,
                    (score->>'created_at')::timestamp,
                    (score->>'updated_at')::timestamp
                FROM jsonb_array_elements(scores_data) AS score;
                
                GET DIAGNOSTICS inserted_count = ROW_COUNT;
                RETURN inserted_count;
            END;
            $$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP FUNCTION IF EXISTS data.insert_validator_scores(jsonb);");
    }
};