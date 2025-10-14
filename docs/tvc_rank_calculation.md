# TVC Rank Calculation

## Overview

TVC (Trustworthy Validator Composite) Rank is a metric that ranks Solana validators based on their TVC Score. The ranking is calculated by sorting validators by their TVC Score in descending order, where the validator with the highest TVC Score receives rank 1.

## How TVC Rank is Calculated

1. All validators with a valid TVC Score are selected
2. Validators are sorted by TVC Score in descending order (highest score first)
3. Each validator is assigned a rank based on their position in the sorted list
4. The validator with the highest TVC Score gets rank 1, the second highest gets rank 2, and so on

## Database Schema

The TVC Rank is stored in the `data.validators` table in the `tvc_rank` column (BIGINT, nullable).

## Functions

### PostgreSQL Function: `data.calculate_tvc_ranks()`

This function calculates and updates the TVC ranks for all validators in the database.

```sql
SELECT data.calculate_tvc_ranks();
```

The function uses a window function to rank validators:
- Validators are ordered by `tvc_score` in descending order
- `ROW_NUMBER()` is used to assign sequential ranks
- Validators with NULL TVC scores are excluded from ranking

## Laravel Commands

### Calculate TVC Ranks

To manually calculate TVC ranks for all validators:

```bash
php artisan tvc:calculate-ranks
```

This command:
1. Calls the PostgreSQL function `data.calculate_tvc_ranks()`
2. Displays statistics about the ranking process
3. Shows the top 5 validators by TVC rank

## Integration with Validator Processing

The TVC rank calculation is separate from the main validator data processing function. After processing validator data and calculating TVC scores with `data.update_validators_common_with_tvc()`, you should call `data.calculate_tvc_ranks()` to update the rankings.

## Example Usage

```php
// Process validator data (calculates TVC scores)
DB::select('SELECT data.update_validators_common_with_tvc(?, ?)', [$validatorData, $currentSlot]);

// Calculate TVC ranks based on the new TVC scores
DB::select('SELECT data.calculate_tvc_ranks()');
```