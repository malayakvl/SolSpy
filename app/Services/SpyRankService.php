<?php

namespace App\Services;

class SpyRankService
{
    public function calculateSpyRank($validator, float $totalStake)
    {
        // Handle both array and object formats
        $epochCredits = null;
        $activatedStake = 0;
        $commission = 0;
        $lastVote = 0;
        $delinquent = false;
        
        if (is_object($validator)) {
            $epochCredits = $validator->epoch_credits ? json_decode($validator->epoch_credits, true) : null;
            $activatedStake = $validator->activated_stake ?? 0;
            $commission = $validator->commission ?? 0;
            $lastVote = $validator->last_vote ?? 0;
            $delinquent = $validator->delinquent ?? false;
        } else if (is_array($validator)) {
            $epochCredits = isset($validator['epoch_credits']) ? json_decode($validator['epoch_credits'], true) : null;
            $activatedStake = $validator['activated_stake'] ?? 0;
            $commission = $validator['commission'] ?? 0;
            $lastVote = $validator['last_vote'] ?? 0;
            $delinquent = $validator['delinquent'] ?? false;
        }

        // 1. Uptime (40%)
        $credits = 0;
        $slots = 1;
        
        if ($epochCredits && is_array($epochCredits)) {
            $credits = array_sum(array_column($epochCredits, 1));
            $slots = array_sum(array_column($epochCredits, 2));
            if ($slots == 0) $slots = 1; // Avoid division by zero
        }
        
        $uptimeScore = ($slots > 0) ? ($credits / $slots) * 100 : 0;

        // 2. Stake Concentration (20%)
        $stakeRatio = ($totalStake > 0) ? ($activatedStake / $totalStake) * 100 : 0;
        $decentralizationScore = max(0, 100 - ($stakeRatio * 10)); // Штраф за большой stake

        // 3. Commission (10%)
        // Convert commission from basis points to percentage if needed
        $commissionPercentage = $commission > 100 ? $commission / 100 : $commission;
        $commissionScore = (1 - $commissionPercentage / 100) * 100;

        // 4. Voting Activity (25%)
        $voteActivityScore = $lastVote > 0 ? min(100, ($lastVote / 1000000) * 100) : 0; // Пример нормализации

        // 5. External Flags (5%) — заглушка, так как требует внешних данных
        // Delinquent validators get a penalty
        $flagsScore = $delinquent ? 0 : 100;

        // Итоговый SpyRank
        $spyRank = (
            0.4 * $uptimeScore +
            0.2 * $decentralizationScore +
            0.1 * $commissionScore +
            0.25 * $voteActivityScore +
            0.05 * $flagsScore
        );

        return round(min(max($spyRank, 0), 100), 2);
    }
}