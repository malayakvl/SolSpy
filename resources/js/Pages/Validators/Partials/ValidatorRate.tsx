import React, { useEffect, useState, useRef } from 'react';


export default function ValidatorRate({ validator, epoch, settingsData, totalStakeData }) {
    const [colorClass, setColorClass] = useState('');
    const prevVoteRateRef = useRef(null);
    
    const validatorCredits = JSON.parse(validator.epoch_credits) || [];
    
    // Фактично відправлені голоси
    const epochCredits = validatorCredits.find(([_epoch]) => _epoch === epoch);
    const actualVotes = epochCredits ? epochCredits[1] : 0;
    
    // For now, just display the actual votes value
    const displayValue = actualVotes;

    useEffect(() => {
        // Skip highlighting on initial render
        if (prevVoteRateRef.current === null) {
            prevVoteRateRef.current = displayValue;
            return;
        }
        
        // Only highlight if there's an actual change
        if (prevVoteRateRef.current !== displayValue) {
            const isLower = displayValue < prevVoteRateRef.current;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            // Update the ref to current value
            prevVoteRateRef.current = displayValue;

            // Clear the highlight after 1 second
            const timeout = setTimeout(() => {
                setColorClass('');
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [displayValue]);



    return (
        <span className={`transition-colors duration-300 ${colorClass}`} style={{ width: '120px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {displayValue.toLocaleString()}
    </span>
    );
}