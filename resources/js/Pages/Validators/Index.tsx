import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import React, { useEffect, useState, Suspense } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import MovingGridTable from "../../Components/GridResult";
import Example from "../../Components/GridResult/Ts";
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./ValidatorCredits";

const colValidatorsFull = [
    { accessorKey: 'asn', header: 'ASN', enableHiding: true },
    { accessorKey: 'city', header: 'City', enableHiding: true },
    { accessorKey: 'comission', header: 'Commission', enableHiding: true },
    { accessorKey: 'country', header: 'Country', enableHiding: true },
    { accessorKey: 'voteCredits', header: 'Vote Credits', enableHiding: true },
    { accessorKey: 'epochStart', header: 'Epoch start', enableHiding: true },
    { accessorKey: 'ip', header: 'IP', enableHiding: true },
    { accessorKey: 'runningJito', header: 'Running Jito', enableHiding: true },
    { accessorKey: 'lastVotedSlot', header: 'Last Voted Slot', enableHiding: true },
    { accessorKey: 'leaderSlot', header: 'Leader Slots', enableHiding: true },
    { accessorKey: 'currentLiquidStake', header: 'Current Liquid Stake', enableHiding: true },
    { accessorKey: 'changeLiquidStake', header: 'Changing Liquid Stake', enableHiding: true },
    { accessorKey: 'targetLiquidStake', header: 'Target Liquid Stake', enableHiding: true },
    { accessorKey: 'locationCoordinated', header: 'Location Coordinates', enableHiding: true },
    { accessorKey: 'mevComission', header: 'MEV Commission', enableHiding: true },
    { accessorKey: 'name', header: 'Name', enableHiding: true },
]

const columns = [
    { accessorKey: 'rank', header: 'Rank', enableHiding: false },
    { accessorKey: 'name', header: 'Name', enableHiding: true },
    { accessorKey: 'ip_asn', header: 'ASN', enableHiding: true },
    { accessorKey: 'ip_city', header: 'City', enableHiding: true },
    { accessorKey: 'ip_country', header: 'Country', enableHiding: true },
    { accessorKey: 'comission', header: 'Commission', enableHiding: true },
    { accessorKey: 'version', header: 'Version', enableHiding: true },
];



export default function Index(validatorsData) {
    const data = validatorsData.validatorsData;
    const rpcUrl = 'http://103.167.235.81:8899';

    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const [validatorData, setValidatorData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [nameLoading, setNameLoading] = useState(false);
    const [storageStatus, setStorageStatus] = useState('');
    const [validatorInfo, setValidatorInfo] = useState({});
    const [voteRates, setVoteRates] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [checkResult, setCheckResult] = useState('');

    const fetchVoteAccounts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getVoteAccounts',
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setValidatorData(result.result.current);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setNameLoading(false);
        }
    };

    const getLastVotedSlot = (key) => {
        const _fData =  validatorData.find(
            _x => _x.votePubkey === key
        );

        if (_fData) {
            return formattedNumData(_fData.lastVote);
        } else {
            return '';
        }
    }


    const formattedNumData = (val) => {
        return Number(val).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
    }


    useEffect(() => {
        fetchVoteAccounts();
        // const intervalId = setInterval(fetchVoteAccounts, 5000);
        // return () => clearInterval(intervalId);
    }, []);


    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('validators.title')} />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>{msg.get('validators.title')}&nbsp;</h2>
                    {/*<button className="btn-submit pl-3" onClick={toggleAgeColumn}>Переключить видимость Age</button>*/}
                    {/*<button className="btn-submit ml-3" onClick={showAgeColumn}>Показать Age</button>*/}
                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 validator-table">
                                <thead>
                                    <tr>
                                        <th>&nbsp;</th>
                                        <th>Spy Rank</th>
                                        <th>Avatar</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>TVC Score</th>
                                        <th>Vote Credits</th>
                                        <th>Active Stake</th>
                                        <th>Inflation Commission</th>
                                        <th>MEV Commission</th>
                                        <th>Uptime</th>
                                        <th>Client</th>
                                        <th>Status SFDP</th>
                                        <th>Location</th>
                                        <th>Awards</th>
                                        <th>Vote Rate</th>
                                        <th>Website</th>
                                        <th>City</th>
                                        <th>ASN</th>
                                        <th>IP</th>
                                        <th>Jiito Score</th>
                                        <th>&nbsp;</th>


                                        {/*<th>Rank</th>*/}
                                        {/*<th>Name</th>*/}
                                        {/*<th>Last Voted Slot</th>*/}
                                        {/*<th>Vote Credits</th>*/}
                                        {/*<th>Stake</th>*/}
                                        {/*<th>Stake Changes</th>*/}
                                        {/*<th className="text-center">Comission</th>*/}
                                        {/*<th>Stake Account</th>*/}
                                        {/*<th>Leader Slots</th>*/}
                                        {/*<th>Leader Slots Done</th>*/}
                                        {/*<th>Leader Slots Skipped</th>*/}
                                        {/*<th>ASN</th>*/}
                                        {/*<th>Location Coordinates</th>*/}
                                        {/*<th>City</th>*/}
                                        {/*<th>Country</th>*/}
                                        {/*<th>Epoch start</th>*/}
                                        {/*<th>IP</th>*/}
                                        {/*<th>Running Jito</th>*/}
                                        {/*<th>Current Liquid Stake</th>*/}
                                        {/*<th>Changing Liquid Stake</th>*/}
                                        {/*<th>Target Liquid Stake</th>*/}
                                        {/*<th>MEV Commission</th>*/}
                                        {/*<th>ASN Organization</th>*/}
                                        {/*<th>Root Slot</th>*/}
                                        {/*<th>Score</th>*/}
                                        {/*<th>Skip Rate</th>*/}
                                        {/*<th>Status</th>*/}
                                        {/*<th>Superminority</th>*/}
                                        {/*<th>Uptime (30d)</th>*/}
                                        {/*<th>Version</th>*/}
                                        {/*<th>Vote Success</th>*/}
                                    </tr>
                                </thead>
                                <tbody>
                                {data.map((validator, index) => (
                                    <tr
                                        key={validator.id} // Унікальний ключ для кожного рядка
                                        className={`${
                                            index % 2 === 0
                                                ? 'bg-white dark:bg-gray-900'
                                                : 'bg-gray-50 dark:bg-gray-800'
                                        } border-b dark:border-gray-700 border-gray-200`}
                                    >
                                        <td className="px-6 py-4 text-center w-[50px]">{validator.rank}</td>
                                        <th
                                            scope="row"
                                            className="min-w-[150px] px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center space-x-3"
                                        >
                                            {/* Validator avatar */}
                                            {validator.avatar_file_url ? (
                                                <img
                                                    src={validator.avatar_file_url}
                                                    alt={`${validator.name} avatar`}
                                                    className="rounded-full w-[32px] h-[32px] object-cover flex-shrink-0"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/32';
                                                    }}
                                                />
                                            ) : (
                                                <div className="rounded-full w-[32px] h-[32px] bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                                            )}
                                            {/* Name and vote_pubkey with icon */}
                                            <div className="flex flex-col">
                                                <span className="truncate v-truncate min-w-[190px]">{validator.name}</span>
                                                <div className="flex items-center space-x-2">
                                                  <span
                                                      className="text-[11px] text-gray-500 dark:text-blue-400 truncate v-truncate max-w-[150px] hover:underline"
                                                      title={validator.vote_pubkey} // Full vote_pubkey on hover
                                                  >
                                                    {validator.vote_pubkey}
                                                  </span>
                                                  <a href={`https://solscan.io/account/${validator.vote_pubkey}`} target="_blank">
                                                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-[12px] h-[12px]" />
                                                  </a>
                                                </div>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4">{getLastVotedSlot(validator.vote_pubkey)}</td>
                                        <td className="px-6 py-4">
                                            <ValidatorCredits voteData={validatorData} validator={validator} />
                                            {/*<Suspense fallback="Loading...">*/}
                                            {/*    <VoteRate votePubkey={validator.vote_pubkey} identityPubkey={validator.node_pubkey} />*/}
                                            {/*</Suspense>*/}
                                        </td>
                                        <td className="px-6 py-4">
                                            {Number(validator.activated_stake).toLocaleString('en-US', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            })}
                                        </td>
                                        <td className="px-6 py-4">Stake Account</td>
                                        <td className="px-6 py-4 max-w-[70px] text-center">{validator.commission}%</td>
                                        <td className="px-6 py-4">Leader Slots</td>
                                        <td className="px-6 py-4">Leader Slots Done</td>
                                        <td className="px-6 py-4">Leader Slots Skipped</td>
                                        <td className="px-6 py-4">&nbsp;</td>
                                        <td className="px-6 py-4">{validator.ip_asn}</td>
                                        <td className="px-6 py-4">{validator.latitude},<br/> {validator.longitude}</td>
                                        <td className="px-6 py-4">{validator.ip_city}<br/>{validator.v_city}</td>
                                        <td className="px-6 py-4">{validator.ip_country}<br/>{validator.v_country}</td>
                                        <td className="px-6 py-4">{validator.start_epoch}</td>
                                        <td className="px-6 py-4">{validator.ip}</td>
                                        <td className="px-6 py-4">Running Jito</td>
                                        <td className="px-6 py-4">Last Voted Slot</td>
                                        <td className="px-6 py-4">Current Liquid Stake</td>
                                        <td className="px-6 py-4">Changing Liquid Stake</td>
                                        <td className="px-6 py-4">Target Liquid Stake</td>
                                        <td className="px-6 py-4">MEV Commission</td>
                                        <td className="px-6 py-4">Root Slot</td>
                                        <td className="px-6 py-4">Root Slot</td>
                                        {/*<td className="px-6 py-4">Score</td>*/}
                                        <td className="px-6 py-4">Skip Rate</td>
                                        <td className="px-6 py-4">Status</td>
                                        <td className="px-6 py-4">{validator.superminority === 1 ? 'Yes' : 'No'}</td>
                                        <td className="px-6 py-4">{validator.uptime}</td>
                                        <td className="px-6 py-4">{validator.version}</td>
                                        <td className="px-6 py-4">&nbsp;</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                        {/*<MaterialReactTable table={table} />*/}
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
