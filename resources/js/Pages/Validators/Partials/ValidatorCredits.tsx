import React, { useEffect, useState } from 'react';

export default function ValidatorCredits({ validator, epoch }) {
    const [prevVoteCredit, setPrevVoteCredit] = useState(0);
    const [colorClass, setColorClass] = useState('');

    // Вычисление текущего значения voteCredit
    let _voteCredit = 0;
    const epochData = JSON.parse(validator?.epoch_credits ? validator.epoch_credits : '[]');
    if (epochData.length > 0) {
        const result = epochData.find(subArray => subArray[0] === epoch);
        if (result) {
            _voteCredit = Number(result[1]);
        }
    }

    useEffect(() => {
        if (prevVoteCredit !== _voteCredit) {
            const isLower = _voteCredit < prevVoteCredit;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);

            setPrevVoteCredit(_voteCredit);

            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 1000);
        }
    }, [_voteCredit, prevVoteCredit]);

    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
      {_voteCredit.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
      })}
    </span>
    );
}
