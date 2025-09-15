import React, { useEffect, useState } from 'react';


export default function ValidatorRate({ validator, epoch, settingsData, totalStakeData }) {
    const [colorClass, setColorClass] = useState('');
    const [prevVoteRate, setPrevVoteRate] = useState(0);

    const validatorCredits = JSON.parse(validator.epoch_credits) || [];
    const scheduleSlots = validator.slots ? JSON.parse(validator.slots) : [];
    let _voteRate = 0;


    // Фактично відправлені голоси
    const epochCredits = validatorCredits.find(([_epoch]) => _epoch === epoch);
    const actualVotes = epochCredits ? epochCredits[1] : 0;

    // Отримуємо дані для розрахунку очікуваних голосів
    const activatedStake = validator.activated_stake;
    const expectedVotes = scheduleSlots.length || 0;
    const slotsInEpoch = settingsData.slot_in_epoch;

    const totalNetworkStakeSOL = totalStakeData.total_network_stake_sol;
    const validatorCount = totalStakeData.validator_count;

    const stakeFraction = activatedStake / totalNetworkStakeSOL;
    const approxExpectedVotes = Math.round(stakeFraction * slotsInEpoch * 0.4);
    _voteRate = actualVotes/approxExpectedVotes;

    // Виведення
    // console.log(`Валідатор: ${validator.vote_pubkey}`);
    // console.log(`Епоха: 848`);
    // console.log(`Фактично відправлені голоси: ${actualVotes}`);
    // console.log(`Очікувані голоси (з leader schedule): ${expectedVotes}`);
    // console.log(`Очікувані голоси (приблизно): ${approxExpectedVotes}`);
    // console.log(`VoteRate Calc: ${_voteRate}`);

    useEffect(() => {
        if (prevVoteRate !== _voteRate) {
            const isLower = _voteRate < prevVoteRate;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 1000);

            setPrevVoteRate(_voteRate);

            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 1000);
        }
    }, [_voteRate, prevVoteRate]);



    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
        {_voteRate.toFixed(4)}
    </span>
    );
}