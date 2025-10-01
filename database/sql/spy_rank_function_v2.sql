-- Updated SpyRank function that calculates total_stake internally
CREATE OR REPLACE FUNCTION calculate_spy_rank(
    p_epoch_credits JSONB,
    p_activated_stake NUMERIC,
    p_commission NUMERIC,
    p_last_vote NUMERIC,
    p_delinquent BOOLEAN
) RETURNS NUMERIC AS $$
DECLARE
    credits NUMERIC := 0;
    slots NUMERIC := 1;
    uptime_score NUMERIC := 0;
    stake_ratio NUMERIC := 0;
    decentralization_score NUMERIC := 0;
    commission_percentage NUMERIC := 0;
    commission_score NUMERIC := 0;
    vote_activity_score NUMERIC := 0;
    flags_score NUMERIC := 0;
    spy_rank NUMERIC := 0;
    p_total_stake NUMERIC := 0;
BEGIN
    -- Calculate total stake internally
    SELECT COALESCE(SUM(activated_stake), 0) INTO p_total_stake
    FROM data.validators
    WHERE activated_stake IS NOT NULL
        AND epoch_credits IS NOT NULL;

    -- 1. Uptime (40%)
    IF p_epoch_credits IS NOT NULL AND jsonb_array_length(p_epoch_credits) > 0 THEN
        -- Sum credits (second element of each array) and slots (third element)
        SELECT 
            COALESCE(SUM((elem->1)::NUMERIC), 0),
            COALESCE(SUM((elem->2)::NUMERIC), 1)
        INTO credits, slots
        FROM jsonb_array_elements(p_epoch_credits) AS elem;
        
        IF slots = 0 THEN
            slots := 1;
        END IF;
        
        uptime_score := (credits / slots) * 100;
    END IF;

    -- 2. Stake Concentration (20%)
    IF p_total_stake > 0 THEN
        stake_ratio := (p_activated_stake / p_total_stake) * 100;
    END IF;
    decentralization_score := GREATEST(0, 100 - (stake_ratio * 10));

    -- 3. Commission (10%)
    commission_percentage := CASE 
        WHEN p_commission > 100 THEN p_commission / 100 
        ELSE p_commission 
    END;
    commission_score := (1 - commission_percentage / 100) * 100;

    -- 4. Voting Activity (25%)
    IF p_last_vote > 0 THEN
        vote_activity_score := LEAST(100, (p_last_vote / 1000000) * 100);
    END IF;

    -- 5. External Flags (5%)
    flags_score := CASE 
        WHEN p_delinquent THEN 0 
        ELSE 100 
    END;

    -- Итоговый SpyRank
    spy_rank := (
        0.4 * uptime_score +
        0.2 * decentralization_score +
        0.1 * commission_score +
        0.25 * vote_activity_score +
        0.05 * flags_score
    );

    RETURN ROUND(GREATEST(0, LEAST(spy_rank, 100)), 2);
END;
$$ LANGUAGE plpgsql;