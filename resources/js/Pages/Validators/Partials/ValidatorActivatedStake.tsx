import React, { useEffect, useState, useRef } from 'react';

export default function ValidatorActivatedStake({validator, epoch}) {
    const [colorClass, setColorClass] = useState('');
    const prevStakeRef = useRef(validator?.activated_stake);

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

    useEffect(() => {
        // Check if stake value has changed
        if (prevStakeRef.current !== undefined && prevStakeRef.current !== validator?.activated_stake) {
            // Value has changed, set highlight color
            setColorClass('bg-yellow-200 animate-pulse');
            
            // Reset the highlight after 2 seconds
            const timer = setTimeout(() => {
                setColorClass('');
            }, 2000);
            
            return () => clearTimeout(timer);
        }
        
        // Update the ref with current value
        prevStakeRef.current = validator?.activated_stake;
    }, [validator?.activated_stake]);

    return (
        <>
            <span className={`whitespace-nowrap ${colorClass}`}>{formatSOL(validator.activated_stake)}</span>
            <span className={`text-xs text-gray-500 block ${colorClass}`}>
                {Number(validator.activated_stake).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                })}
            </span>
        </>
    );
}