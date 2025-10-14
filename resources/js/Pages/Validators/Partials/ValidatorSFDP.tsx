import React, { useEffect, useState } from 'react';

export default function ValidatorSFDP({ validator, epoch, type = 'table' }) {
    // Determine color class based on eligibility 
    let statusColorClass = 'text-gray-500';
    let bgColorClass = 'bg-gray-100';
    if (validator.sfdp_status === 'onboard') {
        statusColorClass = 'text-green-500';
        bgColorClass = 'bg-green-100';
    } else if (validator.sfdp_status === 'pending') {
        statusColorClass = 'text-yellow-500';
        bgColorClass = 'bg-yellow-100';
    } else if (validator.sfdp_status === 'rejected') {
        statusColorClass = 'text-red-500';
        bgColorClass = 'bg-red-100';
    } else if (validator.sfdp_status === 'retired') {
        statusColorClass = 'text-orange-500';
        bgColorClass = 'bg-orange-100';
    } else {
        statusColorClass = 'text-gray-500';
        bgColorClass = 'bg-gray-100';
    }

    return (
        <>
            {type !== 'card' ? (
                <span className={`${statusColorClass} ${bgColorClass} border rounded-lg px-2 py-1 text-[12px] font-semibold`}>
                    {validator.sfdp_status || 'unknown'}
                </span>
            ) : (
                <span className={`${statusColorClass} ${bgColorClass} border rounded-lg px-2 py-1 text-[10px] font-semibold uppercase`}>
                    {validator.sfdp_status || 'unknown'}
                </span>
            )}
        </>
    );
}