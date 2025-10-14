-- Function to update spy_rank for all validators
CREATE OR REPLACE FUNCTION data.update_all_validators_spy_rank()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_vote_pubkey TEXT;
    v_spy_rank NUMERIC;
BEGIN
    -- Loop through all validators and update their spy_rank
    FOR v_vote_pubkey IN 
        SELECT vote_pubkey 
        FROM data.validators 
        WHERE epoch_credits IS NOT NULL 
        AND activated_stake IS NOT NULL
    LOOP
        -- Update spy_rank for this validator
        v_spy_rank := data.update_validator_spy_rank(v_vote_pubkey);
        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;