import React, { useEffect, useState } from 'react';

// export default function ValidatorSpyRank({validator, validators}) {
//
//     useEffect(() => {
//         console.log(validator.spyRank)
//     }, [validator])
//
//
//     return (
//         <>{validator.spyRank}</>
//     );
// }
export default function ValidatorSpyRank({ validator }) {
    const [prevSpyRank, setPrevSpyRank] = useState(validator.spyRank);
    const [colorClass, setColorClass] = useState('');

    useEffect(() => {
        if (prevSpyRank !== validator.spyRank) {
            const isLower = validator.spyRank < prevSpyRank;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);

            setPrevSpyRank(validator.spyRank);

            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setColorClass(''); // Подсветка исчезает через 2 секунды
            }, 2000);
        }
    }, [validator.spyRank, prevSpyRank]);


    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
            -
        </span>
    );
}
