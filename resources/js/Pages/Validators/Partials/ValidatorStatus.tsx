import React, { useEffect, useState } from 'react';

export default function ValidatorStatus({ validator, epoch, type = 'table' }) {
    // Determine color class based on eligibility 
    let statusColorClass = 'text-red-500';
    let bgColorClass = 'bg-red-100';
    if (!validator.delinquent ) {
        statusColorClass = 'text-green-500';
        bgColorClass = 'bg-green-100';
    }

    return (
        <>
            <span className={`${statusColorClass} ${bgColorClass} border rounded-lg px-2 py-1 text-[10px] font-semibold uppercase`}>
                {validator.delinquent ? 'Delinquent' : 'Active'}
            </span>
        </>
    );
}