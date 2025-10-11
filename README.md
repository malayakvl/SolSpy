# SolSpy - Solana Validator Monitoring

SolSpy is a comprehensive monitoring and analytics platform for Solana validators.

## Features

- Real-time validator performance monitoring
- Trustworthy Validator Composite (TVC) scoring system
- Jito-specific validator scoring
- Detailed validator metrics and statistics
- Performance ranking and comparison tools

## TVC (Trustworthy Validator Composite) System

The TVC system is a comprehensive scoring mechanism that evaluates Solana validators based on multiple factors:

### TVC Score Calculation

TVC Score = earnedCredits × TVR × (1 - commission/100) × log(1 + activatedStake)

Where:
- **earnedCredits**: Difference between the second and third values of the last epochCredits element
- **TVR** (Timely Vote Rate): 1 - (current_slot - lastVote) / (current_slot - rootSlot)
- **MVR** (Missed Vote Rate): 1 - TVR
- **commission**: Validator commission rate
- **activatedStake**: Amount of SOL staked to the validator

### TVC Rank Calculation

TVC Rank represents a validator's position in the overall ranking based on their TVC Score:
- Validators are sorted by TVC Score in descending order
- The validator with the highest TVC Score receives rank 1
- [Documentation for TVC Rank Calculation](docs/tvc_rank_calculation.md)

## Jito Calculation System

The Jito calculation system extends the TVC system with Jito-specific metrics:

### Additional Metrics
- **Vote Credit Ratio**: earned_credits / max_epoch_credits
- **Yield Score**: vote_credit_ratio × (1 - commission/100)
- **Jito Score**: yield_score × jito_factor × delinquency_factor × blacklist_factor × commission_stability_factor

[Documentation for Jito Calculation](docs/jito_calculation.md)

## Database Schema

Validators data is stored in the `data.validators` table with the following key columns:
- `vote_pubkey`: Validator's vote account public key
- `node_pubkey`: Validator's node account public key
- `activated_stake`: Amount of SOL staked to the validator
- `commission`: Validator commission rate
- `earned_credits`: Calculated earned credits
- `tvr`: Timely Vote Rate
- `mvr`: Missed Vote Rate
- `tvc_score`: Trustworthy Validator Composite Score
- `tvc_rank`: Trustworthy Validator Composite Rank
- `vote_credit_ratio`: Vote credit ratio for Jito scoring
- `yield_score`: Yield score for Jito scoring
- `jito_score`: Jito composite score

## Commands

### Calculate TVC Ranks

To manually calculate TVC ranks for all validators:

```bash
php artisan tvc:calculate-ranks
```

### Update Validators with TVC and Jito Calculations

To update validators with both TVC and Jito calculations:

```bash
php artisan validators:update-tvc-jito
```

## License

The SolSpy project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).