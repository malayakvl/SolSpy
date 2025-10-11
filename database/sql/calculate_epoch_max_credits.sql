-- Function to calculate and populate maximum earned credits for each epoch
CREATE OR REPLACE FUNCTION data.calculate_epoch_max_credits()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Calculate maximum earned credits for each epoch
    -- This function should be run after validator data is updated
    INSERT INTO data.epoch_max_credits (epoch, max_earned_credits)
    SELECT 
        epoch,
        MAX(earned_credits) as max_earned_credits
    FROM (
        SELECT 
            (epoch_credits->(jsonb_array_length(epoch_credits) - 1)->>0)::int as epoch,
            (epoch_credits->(jsonb_array_length(epoch_credits) - 1)->>1)::bigint - 
            (epoch_credits->(jsonb_array_length(epoch_credits) - 1)->>2)::bigint as earned_credits
        FROM data.validators
        WHERE epoch_credits IS NOT NULL 
        AND jsonb_typeof(epoch_credits) = 'array' 
        AND jsonb_array_length(epoch_credits) > 0
    ) as earned_credits_data
    WHERE earned_credits IS NOT NULL
    GROUP BY epoch
    ON CONFLICT (epoch) 
    DO UPDATE SET 
        max_earned_credits = EXCLUDED.max_earned_credits;
END;
$function$;