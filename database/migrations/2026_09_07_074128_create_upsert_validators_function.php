<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared("
            CREATE OR REPLACE FUNCTION data.sync_solana_validators(validators_data JSONB)
            RETURNS VOID AS $$
            BEGIN
                -- 1. Обнуляємо active та delinquent для ВСІХ нод
                UPDATE data.validators 
                SET active = false, 
                    delinquent = false;

                -- 2. Робимо UPSERT із точним вказанням унікальної пари (vote_pubkey, node_pubkey)
                INSERT INTO data.validators (
                    vote_pubkey, 
                    node_pubkey, 
                    activated_stake, 
                    credits_current_epoch, 
                    delinquent, 
                    commission, 
                    active, 
                    updated_at
                )
                SELECT 
                    v->>'vote_pubkey',
                    v->>'node_pubkey',
                    (v->>'activated_stake')::BIGINT,
                    (v->>'credits_current_epoch')::BIGINT,
                    (v->>'is_delinquent')::BOOLEAN,
                    (v->>'commission')::DOUBLE PRECISION,
                    true AS active,
                    NOW()
                FROM jsonb_array_elements(validators_data) AS v
                ON CONFLICT (vote_pubkey, node_pubkey) DO UPDATE SET
                    activated_stake = EXCLUDED.activated_stake,
                    credits_current_epoch = EXCLUDED.credits_current_epoch,
                    delinquent = EXCLUDED.delinquent,
                    commission = EXCLUDED.commission,
                    active = true,
                    updated_at = NOW();
            END;
            $$ LANGUAGE plpgsql;
        ");
    }

    public function down(): void
    {
        DB::unprepared("DROP FUNCTION IF EXISTS data.sync_solana_validators(JSONB);");
    }
};