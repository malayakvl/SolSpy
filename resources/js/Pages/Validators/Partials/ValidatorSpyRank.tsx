import React, { useEffect, useState } from 'react';

export default function ValidatorSpyRank({ validator }) {
    const [prevSpyRank, setPrevSpyRank] = useState(validator.spy_rank);
    const [colorClass, setColorClass] = useState('');

    useEffect(() => {
        if (prevSpyRank !== validator.spy_rank) {
            const isLower = validator.spy_rank < prevSpyRank;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);

            setPrevSpyRank(validator.spy_rank);

            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);
        }
    }, [validator.spy_rank, prevSpyRank]);


    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
            {validator.spy_rank}
        </span>
    );
}
