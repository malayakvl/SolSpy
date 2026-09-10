import React, { useEffect, useState, useRef } from 'react';


export default function ValidatorVoteRate({ validator, epoch, settingsData, totalStakeData }) {
    const [colorClass, setColorClass] = useState('');
    const prevVoteRateRef = useRef(null);




    return (
    <span>
        {validator.vote_rate}
    </span>
    );
}