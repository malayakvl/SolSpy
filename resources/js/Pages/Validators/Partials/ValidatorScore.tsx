import React, { useEffect, useState } from 'react';

export default function ValidatorScore({validator}) {
    const [tvcScore, setTvcScore] = useState(null);

    return (
        <>{validator.tvcRank}</>
    );
}