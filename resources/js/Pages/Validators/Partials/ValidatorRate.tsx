import React, { useEffect, useState, useRef } from 'react';


export default function ValidatorRate({ validator, epoch, settingsData, totalStakeData }) {
    const [colorClass, setColorClass] = useState('');
    const prevVoteRateRef = useRef(null);

    const validatorCredits = JSON.parse(validator.epoch_credits) || [];
    const scheduleSlots = validator.slots ? JSON.parse(validator.slots) : [];
    let _voteRate = 0;

    // Фактично відправлені голоси
    const epochCredits = validatorCredits.find(([_epoch]) => _epoch === epoch);
    const actualVotes = epochCredits ? epochCredits[1] : 0;
    // Отримуємо дані для розрахунку очікуваних голосів
    const activatedStake = validator.activated_stake;
    const expectedVotes = scheduleSlots.length || 0;
    const slotsInEpoch = settingsData.slot_in_epoch || 0;

    const totalNetworkStakeSOL = totalStakeData.total_network_stake_sol || 1;
    const validatorCount = totalStakeData.validator_count || 1;

    // Add safety checks to prevent division by zero
    const stakeFraction = totalNetworkStakeSOL > 0 ? activatedStake / totalNetworkStakeSOL : 0;
    const approxExpectedVotes = Math.round(stakeFraction * slotsInEpoch * 0.4) || 1;
    
    // Prevent division by zero
    _voteRate = approxExpectedVotes > 0 ? actualVotes / approxExpectedVotes : 0;
    
    // console.log('stakeFraction: ', stakeFraction);
    // console.log('totalNetworkStakeSOL: ', totalNetworkStakeSOL);
    // console.log(stakeFraction * slotsInEpoch)

    // Виведення
    // console.log(`Валідатор: ${validator.vote_pubkey}`);
    // console.log(`Епоха: 848`);
    // console.log(`Фактично відправлені голоси: ${actualVotes}`);
    // console.log(`Очікувані голоси (з leader schedule): ${expectedVotes}`);
    // console.log(`Очікувані голоси (приблизно): ${approxExpectedVotes}`);
    // console.log(`VoteRate Calc: ${_voteRate}`);

    useEffect(() => {
        // Skip highlighting on initial render
        if (prevVoteRateRef.current === null) {
            prevVoteRateRef.current = _voteRate;
            return;
        }
        
        // Only highlight if there's an actual change
        if (prevVoteRateRef.current !== _voteRate) {
            const isLower = _voteRate < prevVoteRateRef.current;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            // Update the ref to current value
            prevVoteRateRef.current = _voteRate;

            // Clear the highlight after 1 second
            const timeout = setTimeout(() => {
                setColorClass('');
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [_voteRate]);



    return (
        <span className={`transition-colors duration-300 ${colorClass}`} style={{ width: '120px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {_voteRate.toString()}
    </span>
    );
}