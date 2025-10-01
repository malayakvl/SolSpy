-- Function to update spy_rank for a specific validator
CREATE OR REPLACE FUNCTION update_validator_spy_rank(p_vote_pubkey TEXT)
RETURNS NUMERIC AS $$
DECLARE
    v_epoch_credits JSONB;
    v_activated_stake NUMERIC;
    v_commission NUMERIC;
    v_last_vote NUMERIC;
    v_delinquent BOOLEAN;
    v_spy_rank NUMERIC;
BEGIN
    -- Get validator data
    SELECT 
        epoch_credits,
        activated_stake,
        commission,
        last_vote,
        delinquent
    INTO 
        v_epoch_credits,
        v_activated_stake,
        v_commission,
        v_last_vote,
        v_delinquent
    FROM data.validators
    WHERE vote_pubkey = p_vote_pubkey;

    -- Calculate spy_rank using our existing function
    v_spy_rank := calculate_spy_rank(
        v_epoch_credits,
        v_activated_stake,
        v_commission,
        v_last_vote,
        v_delinquent
    );

    -- Update the validator record with the calculated spy_rank
    UPDATE data.validators
    SET spy_rank = v_spy_rank
    WHERE vote_pubkey = p_vote_pubkey;

    RETURN v_spy_rank;
END;
$$ LANGUAGE plpgsql;