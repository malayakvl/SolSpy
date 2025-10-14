<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class TotalStakeService
{
    public function getTotalStake()
    {
        $totalStakeQuery = "
            SELECT COALESCE(SUM(activated_stake) / 1000000000.0, 0) as total_network_stake_sol,
                COUNT(*) as validator_count,
                COUNT(activated_stake) as stake_count
            FROM data.validators
            WHERE activated_stake IS NOT NULL
                AND epoch_credits IS NOT NULL
        ";    
        $totalStake = DB::select($totalStakeQuery)[0];

        // Calculate total network stake in lamports for spyRank calculation
        $totalStakeLamports = $totalStake->total_network_stake_sol * 1000000000;

        return array($totalStake, $totalStakeLamports);
    }
}
