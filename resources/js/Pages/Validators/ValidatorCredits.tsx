import React, { useEffect, useState } from 'react';

export default function ValidatorCredits({voteData, validator}) {
    const rpcUrl = 'http://103.167.235.81:8899';
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [voteCredit, setVoteCredit] = useState(null);


    useEffect(() => {
        // fetchVoteRate();
        if (voteData.length > 0) {
            const _vData = voteData.find(_d => _d.votePubkey === validator.vote_pubkey);
            const result = _vData.epochCredits.find(subArray => subArray[0] === 839);
            const resultIndex = _vData.epochCredits.findIndex(subArray => subArray[0] === 839);
            // const previous = resultIndex - 1;

            if (resultIndex) {
                const previous = _vData.epochCredits[resultIndex - 1];
                const tmpData = result[1] - previous[1];

                setVoteCredit(Number(tmpData).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }));
            } else {
                setVoteCredit(0);
            }
        }
    }, [voteData])

    const fetchVoteRate = async () => {
        setLoading(true);
        setError(null);

        try {
            const voteAccount = voteData.find(v => v.votePubkey === validator.vote_pubkey);
            console.log(voteAccount.epochCredits);
            const [ , current, previous ] = voteAccount.epochCredits.slice(-1)[0];
            const voteCount = current - previous;
            // Отримуємо лідер-слоти
            const leaderResp = await fetch(rpcUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: 1,
                    method: "getLeaderSchedule",
                    params: [null, { identity: validator.node_pubkey, }]
                })
            });
            const leaderData = await leaderResp.json();
            // console.log(leaderData)
            const leaderSlots = leaderData.result[validator.node_pubkey].length;
            const voteRate = voteCount / leaderSlots;
            setVoteCredit(`${(voteRate * 100).toFixed(0)}`);


        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            // setNameLoading(false);
        }
    };

    return (
        <>{voteCredit}</>
    );
}
