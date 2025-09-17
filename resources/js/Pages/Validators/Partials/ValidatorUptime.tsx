import React, { useEffect, useState } from 'react';

export default function ValidatorUptime({validator, epoch}) {
    const [uptime, setUptime] = useState(null);

    return (
        <>{validator.avg_uptime != null ? parseFloat(validator.avg_uptime).toFixed(2) : ' - '}</>
    );
}
