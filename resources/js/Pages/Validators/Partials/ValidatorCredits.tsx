import React, { useEffect, useState } from 'react';

export default function ValidatorCredits({ validator, epoch }) {
    const [prevCredits, setPrevCredits] = useState(0);
    const [colorClass, setColorClass] = useState('');

    // Вычисление текущего значения credits
    let _credits = 0;
    const epochData = JSON.parse(validator?.epoch_credits ? validator.epoch_credits : '[]');

    if (epochData.length > 0) {
        const result = epochData.find(subArray => subArray[0] === epoch);
        const resultIndex = epochData.findIndex(subArray => subArray[0] === epoch);
        if (resultIndex >= 1) {
            const previous = epochData[resultIndex - 1];
            const tmpData = result[1] - previous[1];
            _credits = Number(tmpData);
        }
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
        }
    }, [_credits, prevCredits]);

    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
      {_credits.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
      })}
    </span>
    );
}