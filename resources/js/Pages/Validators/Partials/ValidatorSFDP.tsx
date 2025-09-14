import React, { useEffect, useState } from 'react';


export default function ValidatorSFDP({ validator, epoch }) {
    const [prevVoteRate, setPrevVoteRate] = useState(0);
    const [colorClass, setColorClass] = useState('');

    // Вычисление текущего значения voteRate
    let _voteRate = 0;
    const epochData = JSON.parse(validator?.epoch_credits ? validator.epoch_credits : '[]');
    const VOTE_CREDITS_THRESHOLD = 0.97; // 97% of cluster average
    const VOTE_CREDITS_BASELINE = 0.85; // 85% fallback
    const COMMISSION_MAX = 5; // Max commission in %
    const JITO_MEV_MAX = 10; // Max Jito MEV commission in %
    const SELF_STAKE_MIN = 100; // Min self-stake in SOL
    const TOTAL_STAKE_MAX = 1000000; // Max total stake in SOL
    const INFRA_CONCENTRATION_MAX = 10; // Max % from single provider
    const MIN_SOFTWARE_VERSION = "2.3.6"; // Minimum Solana version
    const MIN_FRANKENDANCER_VERSION = "0.707.20306"; // Minimum Frankendancer version
    const METRIC_REPORTING_THRESHOLD = 0.8; // 80% of last 10 epochs
    const TESTNET_PERFORMANCE_MIN_EPOCHS = 5; // Min 5 of 10 epochs

    const isVersionGte = (version, minVersion) => {
        const vParts = version.split('.').map(Number);
        const minParts = minVersion.split('.').map(Number);
        for (let i = 0; i < Math.max(vParts.length, minParts.length); i++) {
        const v = vParts[i] || 0;
        const m = minParts[i] || 0;
        if (v > m) return true;
        if (v < m) return false;
        }
        return true;
    }

    // Initialize result
    let isEligible = true;
    const reasons = [];

    // 1. Vote Credits Check
    const voteCreditsRatio = validator.voteCredits / validator.clusterAvgVoteCredits;
    if (voteCreditsRatio < VOTE_CREDITS_THRESHOLD && voteCreditsRatio < VOTE_CREDITS_BASELINE) {
        isEligible = false;
        reasons.push(`Vote credits (${(voteCreditsRatio * 100).toFixed(2)}%) below threshold (${VOTE_CREDITS_THRESHOLD * 100}% or ${VOTE_CREDITS_BASELINE * 100}% of cluster average)`);
    }

    // // 2. Delinquency Check
    // if (validatorMetrics.isDelinquent) {
    //     isEligible = false;
    //     reasons.push("Validator is delinquent (not voting or zero active stake)");
    // }

    // // 3. Commission Check
    // if (validatorMetrics.commission > COMMISSION_MAX) {
    //     isEligible = false;
    //     reasons.push(`Commission (${validatorMetrics.commission}%) exceeds maximum (${COMMISSION_MAX}%)`);
    // }
    // if (validatorMetrics.jitoMevCommission > JITO_MEV_MAX) {
    //     isEligible = false;
    //     reasons.push(`Jito MEV commission (${validatorMetrics.jitoMevCommission}%) exceeds maximum (${JITO_MEV_MAX}%)`);
    // }

    // // 4. Self-Stake Check
    // if (validatorMetrics.selfStake < SELF_STAKE_MIN) {
    //     isEligible = false;
    //     reasons.push(`Self-stake (${validatorMetrics.selfStake} SOL) below minimum (${SELF_STAKE_MIN} SOL)`);
    // }

    // // 5. Total Stake Check
    // if (validatorMetrics.totalStake > TOTAL_STAKE_MAX) {
    //     isEligible = false;
    //     reasons.push(`Total stake (${validatorMetrics.totalStake} SOL) exceeds maximum (${TOTAL_STAKE_MAX} SOL)`);
    // }

    // // 6. Infrastructure Concentration Check
    // if (validatorMetrics.infraConcentration > INFRA_CONCENTRATION_MAX) {
    //     isEligible = false;
    //     reasons.push(`Infrastructure concentration (${validatorMetrics.infraConcentration}%) exceeds maximum (${INFRA_CONCENTRATION_MAX}%)`);
    // }

    // // 7. Software Version Check
    // if (!isVersionGte(validatorMetrics.softwareVersion, MIN_SOFTWARE_VERSION)) {
    //     isEligible = false;
    //     reasons.push(`Software version (${validatorMetrics.softwareVersion}) below minimum (${MIN_SOFTWARE_VERSION})`);
    // }
    // if (!isVersionGte(validatorMetrics.frankendancerVersion, MIN_FRANKENDANCER_VERSION)) {
    //     isEligible = false;
    //     reasons.push(`Frankendancer version (${validatorMetrics.frankendancerVersion}) below minimum (${MIN_FRANKENDANCER_VERSION})`);
    // }

    // // 8. Metric Reporting Check
    // const reportingRatio = validatorMetrics.reportedEpochs / 10;
    // if (reportingRatio < METRIC_REPORTING_THRESHOLD) {
    //     isEligible = false;
    //     reasons.push(`Metric reporting (${(reportingRatio * 100).toFixed(2)}%) below threshold (${METRIC_REPORTING_THRESHOLD * 100}% of last 10 epochs)`);
    // }

    // // 9. Testnet Performance Check
    // if (validatorMetrics.testnetEligibleEpochs < TESTNET_PERFORMANCE_MIN_EPOCHS) {
    //     isEligible = false;
    //     reasons.push(`Testnet performance (${validatorMetrics.testnetEligibleEpochs} epochs) below minimum (${TESTNET_PERFORMANCE_MIN_EPOCHS} of last 10 epochs)`);
    // }

    return (
        <span>
            SFDP
        </span>
    );
}