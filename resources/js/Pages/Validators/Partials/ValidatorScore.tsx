import React, { useEffect, useState } from 'react';

export default function ValidatorScore({validator, validators}) {
    const [tvcScore, setTvcScore] = useState(null);

    return (
        <>{validator.tvcRank}</>
    );
}
