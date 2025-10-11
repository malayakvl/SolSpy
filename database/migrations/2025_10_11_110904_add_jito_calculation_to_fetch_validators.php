<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::unprepared('
            CREATE OR REPLACE FUNCTION data.update_validators_common_with_tvc_jito(validators_data jsonb, current_slot bigint)
            RETURNS void
            LANGUAGE plpgsql
            AS $function$
            DECLARE
                item jsonb;
                epoch_credits jsonb;
                last_element jsonb;
                earned_credits bigint;
                tvr double precision;
                mvr double precision;
                tvc_score double precision;
                last_vote bigint;
                root_slot bigint;
                activated_stake bigint;
                commission integer;
                epoch integer;
                vote_credit_ratio double precision;
                yield_score double precision;
                jito_score double precision;
                max_epoch_credits bigint;
                is_jito boolean := true; -- TODO: получи из другой таблицы
                blacklisted boolean := false; -- TODO: получи из blacklists
                commission_stable boolean := true; -- TODO: следи за историей комиссии
                is_delinquent boolean;
            BEGIN
                -- Проход по валидаторам (текущим и делинквентам)
                FOR item IN
                    SELECT * FROM jsonb_array_elements(validators_data->\'result\'->\'current\')
                    UNION ALL
                    SELECT * FROM jsonb_array_elements(validators_data->\'result\'->\'delinquent\')
                LOOP
                    -- Сброс значений
                    earned_credits := NULL;
                    tvr := NULL;
                    mvr := NULL;
                    tvc_score := NULL;
                    vote_credit_ratio := NULL;
                    yield_score := NULL;
                    jito_score := NULL;
                    max_epoch_credits := NULL;
                    is_delinquent := (item IN (SELECT * FROM jsonb_array_elements(validators_data->\'result\'->\'delinquent\')));
                    
                    -- Достаем credits
                    epoch_credits := item->\'epochCredits\';
                    IF jsonb_typeof(epoch_credits) = \'array\' AND jsonb_array_length(epoch_credits) > 0 THEN
                        last_element := epoch_credits->(jsonb_array_length(epoch_credits) - 1);
                        IF jsonb_typeof(last_element) = \'array\' AND jsonb_array_length(last_element) >= 3 THEN
                            BEGIN
                                epoch := (last_element->>0)::int;
                                earned_credits := (last_element->>1)::bigint - (last_element->>2)::bigint;
                            EXCEPTION WHEN OTHERS THEN
                                earned_credits := NULL;
                            END;
                        END IF;
                    END IF;

                    activated_stake := (item->>\'activatedStake\')::bigint;
                    commission := (item->>\'commission\')::integer;
                    last_vote := (item->>\'lastVote\')::bigint;
                    root_slot := (item->>\'rootSlot\')::bigint;

                    -- TVR / MVR
                    IF current_slot IS NOT NULL AND last_vote IS NOT NULL AND root_slot IS NOT NULL AND current_slot > root_slot THEN
                        BEGIN
                            tvr := 1.0 - (current_slot - last_vote)::double precision / (current_slot - root_slot)::double precision;
                            mvr := 1.0 - tvr;

                            IF earned_credits IS NOT NULL AND activated_stake IS NOT NULL AND commission IS NOT NULL THEN
                                tvc_score := earned_credits * tvr * (1.0 - commission::double precision / 100.0) * LN(1.0 + activated_stake);
                            END IF;
                        EXCEPTION WHEN OTHERS THEN
                            tvr := NULL;
                            mvr := NULL;
                            tvc_score := NULL;
                        END;
                    END IF;

                    -- vote_credit_ratio, yield_score, jito_score
                    IF epoch IS NOT NULL AND earned_credits IS NOT NULL THEN
                        SELECT max_earned_credits INTO max_epoch_credits FROM data.epoch_max_credits WHERE epoch = epoch;

                        IF max_epoch_credits IS NOT NULL AND max_epoch_credits > 0 THEN
                            vote_credit_ratio := earned_credits::double precision / max_epoch_credits;
                            yield_score := vote_credit_ratio * (1.0 - commission::double precision / 100.0);

                            jito_score := yield_score
                                          * CASE WHEN is_jito THEN 1 ELSE 0 END
                                          * CASE WHEN NOT is_delinquent THEN 1 ELSE 0 END
                                          * CASE WHEN NOT blacklisted THEN 1 ELSE 0 END
                                          * CASE WHEN commission_stable THEN 1 ELSE 0 END;
                        END IF;
                    END IF;

                    -- Сохраняем
                    INSERT INTO data.validators (
                        activated_stake,
                        commission,
                        epoch_credits,
                        last_vote,
                        root_slot,
                        vote_pubkey,
                        node_pubkey,
                        earned_credits,
                        delinquent,
                        tvr,
                        mvr,
                        tvc_score,
                        vote_credit_ratio,
                        yield_score,
                        jito_score
                    ) VALUES (
                        activated_stake,
                        commission,
                        epoch_credits,
                        last_vote,
                        root_slot,
                        item->>\'votePubkey\',
                        item->>\'nodePubkey\',
                        earned_credits,
                        is_delinquent,
                        tvr,
                        mvr,
                        tvc_score,
                        vote_credit_ratio,
                        yield_score,
                        jito_score
                    )
                    ON CONFLICT (vote_pubkey, node_pubkey) DO UPDATE SET
                        activated_stake = EXCLUDED.activated_stake,
                        commission = EXCLUDED.commission,
                        epoch_credits = EXCLUDED.epoch_credits,
                        last_vote = EXCLUDED.last_vote,
                        root_slot = EXCLUDED.root_slot,
                        earned_credits = EXCLUDED.earned_credits,
                        delinquent = EXCLUDED.delinquent,
                        tvr = EXCLUDED.tvr,
                        mvr = EXCLUDED.mvr,
                        tvc_score = EXCLUDED.tvc_score,
                        vote_credit_ratio = EXCLUDED.vote_credit_ratio,
                        yield_score = EXCLUDED.yield_score,
                        jito_score = EXCLUDED.jito_score;
                END LOOP;
            END;
            $function$;
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP FUNCTION IF EXISTS data.update_validators_common_with_tvc_jito(jsonb, bigint);');
    }
};