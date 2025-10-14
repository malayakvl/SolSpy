import React, { useEffect, useState } from 'react';

export default function ValidatorJiitoScore({validator, epoch}) {
    let _jiitoScore = '';

    

    return (
        <>
            <span className="text-xs text-gray-500 hidden">
                {validator.jiito_score}
            </span>
        </>
    );
}