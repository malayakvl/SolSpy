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
            CREATE OR REPLACE FUNCTION data.calculate_tvc_ranks()
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
            BEGIN
                -- Calculate TVC ranks based on tvc_score in descending order
                -- Validators with higher tvc_score get lower (better) rank numbers
                WITH ranked_validators AS (
                    SELECT 
                        vote_pubkey,
                        node_pubkey,
                        ROW_NUMBER() OVER (ORDER BY tvc_score DESC NULLS LAST) as calculated_rank
                    FROM data.validators
                    WHERE tvc_score IS NOT NULL
                )
                UPDATE data.validators v
                SET tvc_rank = rv.calculated_rank
                FROM ranked_validators rv
                WHERE v.vote_pubkey = rv.vote_pubkey 
                AND v.node_pubkey = rv.node_pubkey;
            END;
            $function$;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('
            DROP FUNCTION IF EXISTS data.calculate_tvc_ranks();
        ');
    }
};