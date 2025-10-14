CREATE OR REPLACE FUNCTION data.update_validators_common_with_tvc(validators_data jsonb, current_slot bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    item jsonb;
    epoch_credits jsonb;
    earned_credits bigint;
    tvr double precision;
    mvr double precision;
    tvc_score double precision;
    last_element jsonb;
    last_vote bigint;
    root_slot bigint;
    activated_stake bigint;
    commission integer;
BEGIN
    -- Process current validators
    IF validators_data->'result' ? 'current' AND jsonb_typeof(validators_data->'result'->'current') = 'array' THEN
        FOR item IN SELECT jsonb_array_elements.value FROM jsonb_array_elements(validators_data->'result'->'current')
        LOOP
            -- Initialize values to NULL
            earned_credits := NULL;
            tvr := NULL;
            mvr := NULL;
            tvc_score := NULL;
            activated_stake := NULL;
            commission := NULL;
            
            -- Extract epoch_credits for earned_credits calculation
            epoch_credits := item->'epochCredits';
            
            -- Calculate earned_credits as the difference between the second and third values of the last array element
            IF jsonb_typeof(epoch_credits) = 'array' AND jsonb_array_length(epoch_credits) > 0 THEN
                last_element := epoch_credits->(jsonb_array_length(epoch_credits) - 1);
                IF jsonb_typeof(last_element) = 'array' AND jsonb_array_length(last_element) >= 3 THEN
                    BEGIN
                        earned_credits := (last_element->>1)::bigint - (last_element->>2)::bigint;
                    EXCEPTION WHEN OTHERS THEN
                        earned_credits := NULL;
                    END;
                END IF;
            END IF;
            
            -- Extract activated_stake and commission for TVC_Score calculation
            activated_stake := (item->>'activatedStake')::bigint;
            commission := (item->>'commission')::integer;
            
            -- Calculate TVR: 1 - (current_slot - lastVote) / (current_slot - rootSlot)
            last_vote := (item->>'lastVote')::bigint;
            root_slot := (item->>'rootSlot')::bigint;
            
            IF current_slot IS NOT NULL AND last_vote IS NOT NULL AND root_slot IS NOT NULL AND current_slot > root_slot THEN
                BEGIN
                    tvr := 1.0 - CAST((current_slot - last_vote) AS double precision) / CAST((current_slot - root_slot) AS double precision);
                    -- Calculate MVR: 1 - TVR
                    mvr := 1.0 - tvr;
                    
                    -- Calculate TVC_Score: earnedCredits × TVR × (1 - commission/100) × log(1 + activatedStake)
                    IF earned_credits IS NOT NULL AND tvr IS NOT NULL AND activated_stake IS NOT NULL AND commission IS NOT NULL THEN
                        BEGIN
                            tvc_score := CAST(earned_credits AS double precision) * tvr * (1.0 - CAST(commission AS double precision) / 100.0) * LN(1.0 + CAST(activated_stake AS double precision));
                        EXCEPTION WHEN OTHERS THEN
                            tvc_score := NULL;
                        END;
                    END IF;
                EXCEPTION WHEN OTHERS THEN
                    tvr := NULL;
                    mvr := NULL;
                    tvc_score := NULL;
                END;
            END IF;

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
                tvc_score
            )
            VALUES (
                (item->>'activatedStake')::BIGINT,
                (item->>'commission')::INTEGER,
                (item->>'epochCredits')::JSONB,
                (item->>'lastVote')::BIGINT,
                (item->>'rootSlot')::BIGINT,
                item->>'votePubkey',
                item->>'nodePubkey',
                earned_credits,
                false,
                tvr,
                mvr,
                tvc_score
            )
            ON CONFLICT (vote_pubkey, node_pubkey)
            DO UPDATE SET
                activated_stake = EXCLUDED.activated_stake,
                commission = EXCLUDED.commission,
                epoch_credits = EXCLUDED.epoch_credits,
                last_vote = EXCLUDED.last_vote,
                root_slot = EXCLUDED.root_slot,
                vote_pubkey = EXCLUDED.vote_pubkey,
                earned_credits = EXCLUDED.earned_credits,
                delinquent = EXCLUDED.delinquent,
                tvr = EXCLUDED.tvr,
                mvr = EXCLUDED.mvr,
                tvc_score = EXCLUDED.tvc_score;
        END LOOP;
    END IF;
    
    -- Process delinquent validators
    IF validators_data->'result' ? 'delinquent' AND jsonb_typeof(validators_data->'result'->'delinquent') = 'array' THEN
        FOR item IN SELECT jsonb_array_elements.value FROM jsonb_array_elements(validators_data->'result'->'delinquent')
        LOOP
            -- Initialize values to NULL
            earned_credits := NULL;
            tvr := NULL;
            mvr := NULL;
            tvc_score := NULL;
            activated_stake := NULL;
            commission := NULL;
            
            -- Extract epoch_credits for earned_credits calculation
            epoch_credits := item->'epochCredits';
            
            -- Calculate earned_credits as the difference between the second and third values of the last array element
            IF jsonb_typeof(epoch_credits) = 'array' AND jsonb_array_length(epoch_credits) > 0 THEN
                last_element := epoch_credits->(jsonb_array_length(epoch_credits) - 1);
                IF jsonb_typeof(last_element) = 'array' AND jsonb_array_length(last_element) >= 3 THEN
                    BEGIN
                        earned_credits := (last_element->>1)::bigint - (last_element->>2)::bigint;
                    EXCEPTION WHEN OTHERS THEN
                        earned_credits := NULL;
                    END;
                END IF;
            END IF;
            
            -- Extract activated_stake and commission for TVC_Score calculation
            activated_stake := (item->>'activatedStake')::bigint;
            commission := (item->>'commission')::integer;
            
            -- Calculate TVR: 1 - (current_slot - lastVote) / (current_slot - rootSlot)
            last_vote := (item->>'lastVote')::bigint;
            root_slot := (item->>'rootSlot')::bigint;
            
            IF current_slot IS NOT NULL AND last_vote IS NOT NULL AND root_slot IS NOT NULL AND current_slot > root_slot THEN
                BEGIN
                    tvr := 1.0 - CAST((current_slot - last_vote) AS double precision) / CAST((current_slot - root_slot) AS double precision);
                    -- Calculate MVR: 1 - TVR
                    mvr := 1.0 - tvr;
                    
                    -- Calculate TVC_Score: earnedCredits × TVR × (1 - commission/100) × log(1 + activatedStake)
                    IF earned_credits IS NOT NULL AND tvr IS NOT NULL AND activated_stake IS NOT NULL AND commission IS NOT NULL THEN
                        BEGIN
                            tvc_score := CAST(earned_credits AS double precision) * tvr * (1.0 - CAST(commission AS double precision) / 100.0) * LN(1.0 + CAST(activated_stake AS double precision));
                        EXCEPTION WHEN OTHERS THEN
                            tvc_score := NULL;
                        END;
                    END IF;
                EXCEPTION WHEN OTHERS THEN
                    tvr := NULL;
                    mvr := NULL;
                    tvc_score := NULL;
                END;
            END IF;

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
                tvc_score
            )
            VALUES (
                (item->>'activatedStake')::BIGINT,
                (item->>'commission')::INTEGER,
                (item->>'epochCredits')::JSONB,
                (item->>'lastVote')::BIGINT,
                (item->>'rootSlot')::BIGINT,
                item->>'votePubkey',
                item->>'nodePubkey',
                earned_credits,
                true,
                tvr,
                mvr,
                tvc_score
            )
            ON CONFLICT (vote_pubkey, node_pubkey)
            DO UPDATE SET
                activated_stake = EXCLUDED.activated_stake,
                commission = EXCLUDED.commission,
                epoch_credits = EXCLUDED.epoch_credits,
                last_vote = EXCLUDED.last_vote,
                root_slot = EXCLUDED.root_slot,
                vote_pubkey = EXCLUDED.vote_pubkey,
                earned_credits = EXCLUDED.earned_credits,
                delinquent = EXCLUDED.delinquent,
                tvr = EXCLUDED.tvr,
                mvr = EXCLUDED.mvr,
                tvc_score = EXCLUDED.tvc_score;
        END LOOP;
    END IF;
END;
$function$
;