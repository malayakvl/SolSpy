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
        // 1. Убеждаемся, что колонка epoch существует в таблице data.validator_scores
        DB::statement("
            ALTER TABLE data.validator_scores 
            ADD COLUMN IF NOT EXISTS epoch INTEGER NULL;
        ");

        // 2. Создаем или обновляем ВСПОМОГАТЕЛЬНУЮ функцию с двумя параметрами (Основная)
        DB::statement("
            CREATE OR REPLACE FUNCTION data.insert_validator_scores(scores_data jsonb, epoch_val integer)
            RETURNS integer
            LANGUAGE plpgsql
            AS \$function\$
            DECLARE
                inserted_count integer;
            BEGIN
                INSERT INTO data.validator_scores (
                    epoch,
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
                    epoch_val,
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
            \$function\$;
        ");

        // 3. Обновляем СТАРУЮ функцию с одним параметром, чтобы она выбывала новую с NULL (Для обратной совместимости)
        DB::statement("
            CREATE OR REPLACE FUNCTION data.insert_validator_scores(scores_data jsonb)
            RETURNS integer
            LANGUAGE plpgsql
            AS \$function\$
            BEGIN
                RETURN data.insert_validator_scores(scores_data, NULL);
            END;
            \$function\$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // При откате миграции возвращаем старую функцию к исходному виду (без epoch)
        DB::statement("
            DROP FUNCTION IF EXISTS data.insert_validator_scores(jsonb, integer);
        ");

        DB::statement("
            CREATE OR REPLACE FUNCTION data.insert_validator_scores(scores_data jsonb)
            RETURNS integer
            LANGUAGE plpgsql
            AS \$function\$
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
            \$function\$;
        ");
    }
};