import React, { useEffect, useState } from 'react';

export default function ValidatorUptime({validator, epoch}) {
    const [uptime, setUptime] = useState(null);

    useEffect(() => {
        const epochData = JSON.parse(validator?.epoch_stats ? validator?.epoch_stats : '[]');
        if (epochData.length > 0) {
            const result = epochData.find(subArray => subArray.epoch === epoch);
            if (result) {
                setUptime(result.uptime)
            }
        }

    }, [validator])


    return (
        <>{uptime ? uptime : ' - '}</>
    );
}
