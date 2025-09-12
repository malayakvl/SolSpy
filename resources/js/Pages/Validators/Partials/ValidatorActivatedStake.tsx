import React, { useEffect, useState } from 'react';

export default function ValidatorActivatedStake({validator, epoch}) {
    let _activatedStake = '';
    const epochData = JSON.parse(validator?.epoch_stats ? validator?.epoch_stats : '[]');
    if (epochData.length > 0) {
        const result = epochData.find(subArray => subArray.epoch === epoch);
        if (result) {
            _activatedStake = (result.activated_stake)
        }
    }

    const formatSOL = (lamports) => {
        // Конвертация лампорта в SOL
        const sol = lamports / 1e9; // 1e9 = 1,000,000,000
        // Конвертация SOL в K SOL (тысячи SOL)
        const kSol = sol / 1e3; // 1e3 = 1000
        // Округление до двух десятичных знаков и форматирование
        return `${kSol.toFixed(2)}K SOL`;
    }

    

    return (
        <>
            {formatSOL(validator.activated_stake)}
            <span className="text-xs text-gray-500 hidden">
                {Number(validator.activated_stake).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })}
            </span>
        </>
    );
}
