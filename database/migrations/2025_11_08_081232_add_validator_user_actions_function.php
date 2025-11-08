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
            CREATE OR REPLACE FUNCTION data.validator_user_actions(p_user_id integer, p_validator_id integer, p_type character varying)
            RETURNS void
            LANGUAGE plpgsql
            AS \$function\$
            BEGIN
                -- Проверяем, существует ли запись с заданным типом
                IF EXISTS (
                    SELECT 1 FROM data.validators2users
                    WHERE user_id = p_user_id AND validator_id = p_validator_id AND type = p_type
                ) THEN
                    -- Если запись существует, удаляем её
                    DELETE FROM data.validators2users
                    WHERE user_id = p_user_id AND validator_id = p_validator_id AND type = p_type;
                ELSE
                    -- Если записи нет, вставляем новую
                    INSERT INTO data.validators2users (user_id, validator_id, type)
                    VALUES (p_user_id, p_validator_id, p_type)
                    ON CONFLICT (user_id, validator_id, type) DO NOTHING;
                END IF;
            END;
            \$function\$;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP FUNCTION IF EXISTS data.validator_user_actions(integer, integer, character varying);");
    }
};