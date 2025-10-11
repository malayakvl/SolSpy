# Jito Calculation Function

## Overview

The Jito calculation function extends the TVC (Trustworthy Validator Composite) system by adding Jito-specific metrics to validator scoring. This function processes validator data from the Solana RPC and calculates additional metrics including vote credit ratios, yield scores, and Jito scores.

## Function: `data.update_validators_common_with_tvc_jito`

This PostgreSQL function processes validator data and calculates multiple metrics:

### Parameters
- `validators_data` (jsonb): Raw validator data from Solana RPC `getVoteAccounts` method
- `current_slot` (bigint): Current slot number for TVR calculations

### Calculated Metrics
1. **Earned Credits**: Difference between credits in the last epoch
2. **TVR** (Timely Vote Rate): 1 - (current_slot - lastVote) / (current_slot - rootSlot)
3. **MVR** (Missed Vote Rate): 1 - TVR
4. **TVC Score**: earned_credits × TVR × (1 - commission/100) × ln(1 + activated_stake)
5. **Vote Credit Ratio**: earned_credits / max_epoch_credits
6. **Yield Score**: vote_credit_ratio × (1 - commission/100)
7. **Jito Score**: yield_score × jito_factor × delinquency_factor × blacklist_factor × commission_stability_factor

### TODO Items
- Get Jito status from another table
- Get blacklist status from blacklists table
- Monitor commission history for stability

## Database Schema

The function updates the `data.validators` table with the following new columns:
- `vote_credit_ratio` (double precision)
- `yield_score` (double precision)
- `jito_score` (double precision)

## Usage

### Command Line
```bash
php artisan validators:update-tvc-jito
```

### Direct Database Call
```sql
SELECT data.update_validators_common_with_tvc_jito(?, ?);
```

## Related Files
- Migration: `database/migrations/2025_10_11_110904_add_jito_calculation_to_fetch_validators.php`
- SQL Function: `database/sql/update_validators_common_with_tvc_jito.sql`
- Command: `app/Console/Commands/UpdateValidatorsWithTvcJito.php`