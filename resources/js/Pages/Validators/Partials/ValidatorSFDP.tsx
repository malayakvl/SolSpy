import React, { useEffect, useState } from 'react';


export default function ValidatorSFDP({ validator, epoch }) {
    // Initialize result
    let isEligible = true;
    const reasons = [];
    const warnings = [];

    // Constants for SFDP eligibility criteria
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
        // Handle case where version is not provided
        if (!version) return false;
        
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

    // 1. Vote Credits Check
    if (validator.clusterAvgVoteCredits > 0) {
        const voteCreditsRatio = validator.voteCredits / validator.clusterAvgVoteCredits;
        if (voteCreditsRatio < VOTE_CREDITS_THRESHOLD && voteCreditsRatio < VOTE_CREDITS_BASELINE) {
            isEligible = false;
            reasons.push(`Vote credits (${(voteCreditsRatio * 100).toFixed(2)}%) below threshold (${VOTE_CREDITS_THRESHOLD * 100}% or ${VOTE_CREDITS_BASELINE * 100}% of cluster average)`);
        }
    }

    // 2. Delinquency Check
    if (validator.delinquent) {
        isEligible = false;
        reasons.push("Validator is delinquent (not voting or zero active stake)");
    }

    // 3. Commission Check
    // Regular commission check
    const commissionValue = validator.commission !== undefined && validator.commission !== null ? 
        parseFloat(validator.commission) : null;
        
    if (commissionValue !== null) {
        if (commissionValue > COMMISSION_MAX) {
            isEligible = false;
            reasons.push(`Commission (${commissionValue}%) exceeds maximum (${COMMISSION_MAX}%)`);
        }
    } else {
        warnings.push("Commission rate not provided; assuming 0% (may affect eligibility)");
    }
    
    // Jito MEV commission check
    const jitoCommissionValue = validator.jito_commission !== undefined && validator.jito_commission !== null ? 
        parseFloat(validator.jito_commission) : null;
        
    if (jitoCommissionValue !== null) {
        if (jitoCommissionValue > JITO_MEV_MAX) {
            isEligible = false;
            reasons.push(`Jito MEV commission (${jitoCommissionValue}%) exceeds maximum (${JITO_MEV_MAX}%)`);
        }
    } else {
        warnings.push("Jito MEV commission rate not provided; assuming 0% (may affect eligibility)");
    }

    // 4. Self-Stake Check
    if (validator.self_stake !== undefined && validator.self_stake !== null) {
        if (validator.self_stake < SELF_STAKE_MIN) {
            isEligible = false;
            reasons.push(`Self-stake (${validator.self_stake} SOL) below minimum (${SELF_STAKE_MIN} SOL)`);
        }
    } else {
        warnings.push("Self-stake not provided; assuming 0 SOL (may affect eligibility)");
    }

    // 5. Total Stake Check
    if (validator.activated_stake !== undefined && validator.activated_stake !== null) {
        const totalStakeSol = validator.activated_stake / 1000000000; // Convert lamports to SOL
        if (totalStakeSol > TOTAL_STAKE_MAX) {
            isEligible = false;
            reasons.push(`Total stake (${totalStakeSol.toFixed(2)} SOL) exceeds maximum (${TOTAL_STAKE_MAX} SOL)`);
        }
    } else {
        warnings.push("Total stake not provided; assuming 0 SOL (may affect eligibility)");
    }

    // 6. Infrastructure Concentration Check
    // Not available in current data model

    // 7. Software Version Check
    if (validator.version) {
        if (!isVersionGte(validator.version, MIN_SOFTWARE_VERSION)) {
            isEligible = false;
            reasons.push(`Software version (${validator.version}) below minimum (${MIN_SOFTWARE_VERSION})`);
        }
    } else {
        warnings.push("Software version not provided; assuming unknown (may affect eligibility)");
    }

    // 8. Metric Reporting Check
    // Not available in current data model

    // 9. Testnet Performance Check
    // Not available in current data model

    // Determine color class based on eligibility
    let statusColorClass = 'text-gray-500';
    if (isEligible) {
        statusColorClass = 'text-green-500';
    } else {
        statusColorClass = 'text-red-500';
    }

    return (
        <span className={statusColorClass}>
            {isEligible ? 'Eligible' : 'Not Eligible'}
        </span>
    );
}