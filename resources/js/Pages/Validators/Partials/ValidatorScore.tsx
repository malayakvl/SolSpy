import React, { useEffect, useState } from 'react';

export default function ValidatorScore({validator, validators}) {
    const [tvcScore, setTvcScore] = useState(null);

    // const sorted = validators.sort(
    //     (a, b) => Number(b.activated_stake) - Number(a.activated_stake)
    // );
    // const tvcRank = sorted.findIndex(v => v.vote_pubkey === validator.vote_pubkey) + 1;
    // // console.log('TVC RANK', tvcRank);



    return (
        <>{validator.tvcRank}</>
    );
}
