import React, { useEffect, useState, useRef } from 'react';

export default function ValidatorScore({validator}) {
    const [tvcScore, setTvcScore] = useState(null);
    const [colorClass, setColorClass] = useState('');
    const prevScoreRef = useRef(null);

    useEffect(() => {
        // Always fetch live data from API
        fetchValidatorScore();
    }, [validator]);

    const fetchValidatorScore = async () => {
        // Removed setLoading(true)
        try {
            const response = await fetch(`/api/fetch-score?pubkey=${validator.node_pubkey}`);
            const data = await response.json();
            
            if (response.ok) {
                setTvcScore(data);
            }
        } catch (error) {
            console.error('Error fetching validator score:', error);
        } finally {
            // Removed setLoading(false)
        }
    };

    // Determine which value to display
    const displayScore = tvcScore ? tvcScore.rank : (validator.tvcRank || '-');

    // Handle color change effect
    useEffect(() => {
        // Skip highlighting on initial render
        if (prevScoreRef.current === null) {
            prevScoreRef.current = displayScore;
            return;
        }
        
        // Only highlight if there's an actual change and both values are numbers
        if (prevScoreRef.current !== displayScore && 
            !isNaN(prevScoreRef.current) && 
            !isNaN(displayScore)) {
            const isLower = Number(displayScore) > Number(prevScoreRef.current);
            setColorClass(isLower ? 'text-red-500' : 'text-green-500');

            // Update the ref to current value
            prevScoreRef.current = displayScore;

            // Clear the highlight after 1 second
            const timeout = setTimeout(() => {
                setColorClass('');
            }, 1000);

            return () => clearTimeout(timeout);
        } else {
            // Update the ref even if we don't highlight
            prevScoreRef.current = displayScore;
        }
    }, [displayScore]);

    // Show data - from API if available, otherwise fallback
    // Removed loading check
    
    return (
        <div className={`transition-colors duration-300 ${colorClass}`}>
            {displayScore}
        </div>
    );
}