import React, { useEffect, useState } from 'react';

export default function ValidatorJiitoScore({ validator }) {
    const [prevScore, setPrevScore] = useState(0);
    const [colorClass, setColorClass] = useState('');

    // Ensure jiito_score is a number
    let jiitoScore = validator.jiito_score;
    if (jiitoScore === undefined || jiitoScore === null) {
        jiitoScore = 0;
    } else if (typeof jiitoScore === 'string') {
        jiitoScore = parseFloat(jiitoScore) || 0;
    }

    useEffect(() => {
        if (prevScore !== jiitoScore) {
            const isLower = jiitoScore < prevScore;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);

            setPrevScore(jiitoScore);

            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);
        }
    }, [jiitoScore, prevScore]);


    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
            {jiitoScore.toFixed(2)}
        </span>
    );
}