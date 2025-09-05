import React, { useEffect, useState } from 'react';

export default function ValidatorUptime({validator, epoch}) {
    const [uptime, setUptime] = useState(null);

    return (
        <>{validator.avg_uptime != null ? Math.trunc(parseFloat(validator?.avg_uptime) * 100)/100 : ' - '}</>
    );
}
