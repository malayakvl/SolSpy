import React, { useEffect, useState } from 'react';

// export default function ValidatorRate({validator, epoch}) {
//     let _voteRate = '';
//     const epochData = JSON.parse(validator?.epoch_credits ? validator?.epoch_credits : '[]');
//
//     if (epochData.length > 0) {
//         const result = epochData.find(subArray => subArray[0] === epoch);
//         const resultIndex = epochData.findIndex(subArray => subArray[0] === epoch);
//         if (resultIndex >= 1) {
//             const previous = epochData[resultIndex - 1];
//             const tmpData = result[1] - previous[1];
//             _voteRate = (Number(tmpData).toLocaleString('en-US', {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 0
//             }));
//         }
//     }
//
//     return (
//         <>{_voteRate}</>
//     );
// }
export default function ValidatorRate({ validator, epoch }) {
    const [prevVoteRate, setPrevVoteRate] = useState(0);
    const [colorClass, setColorClass] = useState('');

    // Вычисление текущего значения voteRate
    let _voteRate = 0;
    const epochData = JSON.parse(validator?.epoch_credits ? validator.epoch_credits : '[]');

    if (epochData.length > 0) {
        const result = epochData.find(subArray => subArray[0] === epoch);
        const resultIndex = epochData.findIndex(subArray => subArray[0] === epoch);
        if (resultIndex >= 1) {
            const previous = epochData[resultIndex - 1];
            const tmpData = result[1] - previous[1];
            _voteRate = Number(tmpData);
        }
    }

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
      {_voteRate.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
      })}
    </span>
    );
}