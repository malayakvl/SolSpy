import React from 'react';

type ValidatorStatusProps = {
    validator: any;
    type?: string;
};

export default function ValidatorStatus({ validator, type = 'table' }: ValidatorStatusProps) {
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