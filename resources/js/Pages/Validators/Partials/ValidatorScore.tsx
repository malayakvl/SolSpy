import React, { useEffect, useState } from 'react';

export default function ValidatorScore({ validator, epoch }) {
    const [prevCredits, setPrevCredits] = useState(0);
    const [colorClass, setColorClass] = useState('');

    // Вычисление текущего значения credits
    let _credits = validator.tvc_score;
    
    // Ensure _credits is a number
    if (_credits === undefined || _credits === null) {
        _credits = 0;
    } else if (typeof _credits === 'string') {
        _credits = parseFloat(_credits) || 0;
    }

    useEffect(() => {
        if (prevCredits !== _credits) {
            const isLower = _credits < prevCredits;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 1000);

            setPrevCredits(_credits);

            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 1000);

            return () => clearTimeout(timeout);
        }
    }, [_credits, prevCredits]);

    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
            {_credits.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })}
            <br/>{validator.tvc_score}
        </span>
    );
}