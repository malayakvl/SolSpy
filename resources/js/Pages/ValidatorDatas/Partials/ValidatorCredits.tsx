import React, { useEffect, useState, useRef } from 'react';

export default function ValidatorCredits({ validator, epoch }) {
    const [colorClass, setColorClass] = useState('');
    const prevCreditsRef = useRef(null);

    // 1. Вычисление текущего значения _credits
    let _credits = 0;
    const epochData = typeof validator?.epoch_credits === 'string'
        ? JSON.parse(validator.epoch_credits || '[]')
        : (validator?.epoch_credits || []);

    if (Array.isArray(epochData) && epochData.length > 0) {
        const result = epochData.find(subArray => Number(subArray[0]) === Number(epoch));
        if (result && result.length >= 3) {
            _credits = Number(result[1]) - Number(result[2]);
        }
    }

    // 2. Отслеживаем изменение _credits и подсвечиваем
    useEffect(() => {
        // Пропускаем самый первый монтирование (чтобы не было зеленого цвета при загрузке)
        if (prevCreditsRef.current !== null && prevCreditsRef.current !== _credits) {
            const isLower = _credits < prevCreditsRef.current;
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            // Запускаем таймер сброса
            const timer = setTimeout(() => {
                setColorClass('');
            }, 1000);

            // Сохраняем новое значение в ref
            prevCreditsRef.current = _credits;

            return () => clearTimeout(timer);
        } else {
            // Запоминаем начальное значение
            prevCreditsRef.current = _credits;
        }
    }, [_credits]);

    return (
        <span className={`transition-colors duration-300 ${colorClass}`}>
            {_credits.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })}
        </span>
    );
}