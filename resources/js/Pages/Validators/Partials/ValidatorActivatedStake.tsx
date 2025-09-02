import React, { useEffect, useState } from 'react';

export default function ValidatorActivatedStake({validator, epoch}) {
    let _activatedStake = '';
    const epochData = JSON.parse(validator?.epoch_stats ? validator?.epoch_stats : '[]');
    if (epochData.length > 0) {
        const result = epochData.find(subArray => subArray.epoch === epoch);
        if (result) {
            _activatedStake = (result.activated_stake)
        }
    }

    return (
        <>
            {/*{Number(_activatedStake).toLocaleString('en-US', {*/}
            {/*    minimumFractionDigits: 0,*/}
            {/*    maximumFractionDigits: 0*/}
            {/*})} */}
            {/*<br/> */}
            {Number(validator.activated_stake).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            })}
        </>
    );
}
