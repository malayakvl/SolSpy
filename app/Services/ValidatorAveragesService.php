<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ValidatorAveragesService
{
    /**
     * Get average values for a validator across specified number of epochs
     *
     * @param string $validatorKey vote_pubkey or node_pubkey
     * @param int $epochsCount Number of epochs to look back
     * @return array
     */
    public function getValidatorAverages(string $validatorKey, int $epochsCount): array
    {
        $results = DB::select('
            SELECT epoch, avg_uptime, avg_root_slot, avg_stake, avg_commission
            FROM data.calculate_validator_averages(?, ?)
        ', [$validatorKey, $epochsCount]);

        return array_map(function ($row) {
            return [
                'epoch' => $row->epoch,
                'avg_uptime' => (float) $row->avg_uptime,
                'avg_root_slot' => (float) $row->avg_root_slot,
                'avg_stake' => (float) $row->avg_stake,
                'avg_commission' => (float) $row->avg_commission
            ];
        }, $results);
    }

    /**
     * Get overall average values for a validator across specified number of epochs
     *
     * @param string $validatorKey vote_pubkey or node_pubkey
     * @param int $epochsCount Number of epochs to look back
     * @return array
     */
    public function getOverallValidatorAverages(string $validatorKey, int $epochsCount): array
    {
        $results = DB::select('
            SELECT 
                AVG(avg_uptime) as overall_avg_uptime,
                AVG(avg_root_slot) as overall_avg_root_slot,
                AVG(avg_stake) as overall_avg_stake,
                AVG(avg_commission) as overall_avg_commission
            FROM data.calculate_validator_averages(?, ?)
        ', [$validatorKey, $epochsCount]);

        if (empty($results)) {
            return [
                'overall_avg_uptime' => 0,
                'overall_avg_root_slot' => 0,
                'overall_avg_stake' => 0,
                'overall_avg_commission' => 0
            ];
        }

        $row = $results[0];
        return [
            'overall_avg_uptime' => (float) $row->overall_avg_uptime,
            'overall_avg_root_slot' => (float) $row->overall_avg_root_slot,
            'overall_avg_stake' => (float) $row->overall_avg_stake,
            'overall_avg_commission' => (float) $row->overall_avg_commission
        ];
    }
}