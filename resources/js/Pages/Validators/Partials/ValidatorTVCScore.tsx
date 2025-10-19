import React, { useEffect, useState } from 'react';

export default function ValidatorTVCScore({ validator }) {
    const [prevScore, setPrevScore] = useState(0);
    const [colorClass, setColorClass] = useState('');

    // Ensure tvc_score is a number
    let tvcScore = validator.tvc_score;
    if (tvcScore === undefined || tvcScore === null) {
        tvcScore = 0;
    } else if (typeof tvcScore === 'string') {
        tvcScore = parseFloat(tvcScore) || 0;
    }

    useEffect(() => {
        if (prevScore !== tvcScore) {
            const isLower = tvcScore < prevScore;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);

            setPrevScore(tvcScore);

            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);
        }
    }, [tvcScore, prevScore]);


    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
            {tvcScore.toFixed(2)}
        </span>
    );
}