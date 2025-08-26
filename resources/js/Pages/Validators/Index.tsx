import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngDashboard from '../../Lang/Dashboard/translation';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import React, { useEffect, useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import MovingGridTable from "../../Components/GridResult";
import Example from "../../Components/GridResult/Ts";
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';

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

// ModuleRegistry.registerModules([AllCommunityModule]);
// const columns = [
//     { accessorKey: 'name', header: 'Name', enableHiding: true },
//     { accessorKey: 'rank', header: 'Rank', enableHiding: true },
//     { accessorKey: 'voteCredits', header: 'Vote Credits', enableHiding: true },
//     { accessorKey: 'stake', header: 'Stake', enableHiding: true },
//     { accessorKey: 'stakeChanges', header: 'Stake Changes', enableHiding: true },
//     { accessorKey: 'comission', header: 'Commission', enableHiding: true },
//     { accessorKey: 'stakeAccounts', header: 'Stake Accounts', enableHiding: true },
//     { accessorKey: 'leaderSlot', header: 'Leader Slots', enableHiding: true },
//
//     { accessorKey: 'asn', header: 'ASN', enableHiding: true },
//     { accessorKey: 'city', header: 'City', enableHiding: true },
//     { accessorKey: 'country', header: 'Country', enableHiding: true },
//     { accessorKey: 'epochStart', header: 'Epoch start', enableHiding: true },
//     { accessorKey: 'ip', header: 'IP', enableHiding: true },
//     { accessorKey: 'epochStart', header: 'Epoch start', enableHiding: true },
//     { accessorKey: 'runningJito', header: 'Running Jito', enableHiding: true },
//     { accessorKey: 'lastVotedSlot', header: 'Last Voted Slot', enableHiding: true },
//     { accessorKey: 'currentLiquidStake', header: 'Current Liquid Stake', enableHiding: true },
//     { accessorKey: 'changeLiquidStake', header: 'Changing Liquid Stake', enableHiding: true },
//     { accessorKey: 'targetLiquidStake', header: 'Target Liquid Stake', enableHiding: true },
//     { accessorKey: 'locationCoordinated', header: 'Location Coordinates', enableHiding: true },
//     { accessorKey: 'mevComission', header: 'MEV Commission', enableHiding: true },
//     { accessorKey: 'asnOrg', header: 'ASN Organization', enableHiding: true },
//     { accessorKey: 'rootSlot', header: 'Root Slot', enableHiding: true },
//     { accessorKey: 'score', header: 'Score', enableHiding: true },
//     { accessorKey: 'skipRate', header: 'Skip Rate', enableHiding: true },
//     { accessorKey: 'leaderSlotsDone', header: 'Leader Slots Done', enableHiding: true },
//     { accessorKey: 'leaderSlotsSkipped', header: 'Leader Slots Skipped', enableHiding: true },
//     { accessorKey: 'status', header: 'Status', enableHiding: true },
//     { accessorKey: 'superminority', header: 'Superminority', enableHiding: true },
//     { accessorKey: 'uptime', header: 'Uptime (30d)', enableHiding: true },
//     { accessorKey: 'vesion', header: 'Version', enableHiding: true },
//     { accessorKey: 'voteSuccess', header: 'Vote Success', enableHiding: true },
// ];

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
    console.log('Validators data', validatorsData.validatorsData)
    const data = validatorsData.validatorsData;

    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngDashboard,
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

    // const table = useMaterialReactTable({
    //     columns,
    //     data,
    //     enableColumnOrdering: true,
    //     initialState: {
    //         columnVisibility: {
    //             asn: false,
    //             city: false,
    //             country: false,
    //             epochStart: false,
    //             runningJito: false,
    //             lastVotedSlot: false,
    //             currentLiquidStake: false,
    //             changeLiquidStake: false,
    //             targetLiquidStake: false,
    //             leaderSlotsSkipped: false,
    //             locationCoordinated: false,
    //             mevComission: false,
    //             asnOrg: false,
    //             rootSlot: false,
    //             score: false,
    //             skipRate: false,
    //             leaderSlotsDone: false,
    //             status: false,
    //             superminority: false,
    //             uptime: false,
    //             vesion: false,
    //             voteSuccess: false,
    //             ip: false,
    //         }, // Скрыть колонку 'Age' по умолчанию
    //     },
    // });

    // Функция для переключения видимости колонки 'age'
    // const toggleAgeColumn = () => {
    //     table.getColumn('uptime').toggleVisibility(); // Переключает видимость (true/false)
    // };

    // Функция для явного задания видимости
    // const showAgeColumn = () => {
    //     table.setColumnVisibility((prev) => ({
    //         ...prev,
    //         uptime: true, // Установить видимость колонки 'age' в true
    //     }));
    // };

    const fetchVoteAccounts = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://103.167.235.81:8899', {
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
            console.log(result.result.current.length);
//             const _checkValidator =  result.result.current.find(
//                 _x => _x.votePubkey === 'HxRrsnbc6K8CdEo3LCTrSUkFaDDxv9BdJsTDzBKnUVWH'
//             );
//             if (_checkValidator) {
//                 console.log('========================');
//                 console.log('========================');
//                 console.log('Check rate method', _checkValidator)
// //getVoteRateCheck(votePubkey, identityPubkey, voteAccounts)
//                 await getVoteRateCheck(_checkValidator.votePubkey, _checkValidator.nodePubkey, result.result.current)
//                 console.log('========================');
//                 console.log('========================');
//             }


            const sorted = [...result.result.current].sort((a, b) => Number(b.activatedStake) - Number(a.activatedStake));
            console.log(sorted);
            setValidatorData(sorted);

            // Load validator data from localStorage
            const storedData = localStorage.getItem('validator_data');
            const validatorCache = storedData ? JSON.parse(storedData) : {};
            setValidatorInfo(validatorCache);

            // Fetch vote rates for the current page
            // const missingVoteRates = sorted
            //     .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            //     .filter(account => !voteRateCache.has(`${account.votePubkey}-${account.nodePubkey}`));
            //
            // if (missingVoteRates.length > 0) {
            //     const newVoteRates = { ...voteRates };
            //     for (const account of missingVoteRates) {
            //         const cacheKey = `${account.votePubkey}-${account.nodePubkey}`;
            //         const rate = await getVoteRate(account.votePubkey, account.nodePubkey, sorted);
            //         voteRateCache.set(cacheKey, rate);
            //         newVoteRates[account.votePubkey] = rate;
            //         await delay(150); // Rate limiting
            //     }
            //     setVoteRates(newVoteRates);
            // }

            // Fetch validator info for missing pubkeys
            // const missingPubkeys = sorted
            //     .slice(0, itemsPerPage)
            //     .map(account => account.votePubkey)
            //     .filter(pubkey => !validatorCache[pubkey]);
            // if (missingPubkeys.length > 0) {
            //     setNameLoading(true);
            //     await fetchMissingValidatorInfo(missingPubkeys);
            // } else {
            //     setStorageStatus('Все данные валидаторов для первой страницы загружены из localStorage');
            // }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setNameLoading(false);
        }
    };

    useEffect(() => {
        // fetchVoteAccounts();
        // const intervalId = setInterval(fetchVoteAccounts, 2000);
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
                                        <th>Rank</th>
                                        <th>Name</th>
                                        <th>Vote Credits</th>
                                        <th>Stake</th>
                                        <th>Stake Changes</th>
                                        <th className="text-center">Comission</th>
                                        <th>Stake Account</th>
                                        <th>Leader Slots</th>
                                        <th>Leader Slots Done</th>
                                        <th>Leader Slots Skipped</th>
                                        <th>ASN</th>
                                        <th>Location Coordinates</th>
                                        <th>City</th>
                                        <th>Country</th>
                                        <th>Epoch start</th>
                                        <th>IP</th>
                                        <th>Running Jito</th>
                                        <th>Last Voted Slot</th>
                                        <th>Current Liquid Stake</th>
                                        <th>Changing Liquid Stake</th>
                                        <th>Target Liquid Stake</th>
                                        <th>MEV Commission</th>
                                        <th>ASN Organization</th>
                                        <th>Root Slot</th>
                                        <th>Score</th>
                                        <th>Skip Rate</th>
                                        <th>Status</th>
                                        <th>Superminority</th>
                                        <th>Uptime (30d)</th>
                                        <th>Version</th>
                                        <th>Vote Success</th>
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
                                        <td className="px-6 py-4">{validator.credits}</td>
                                        <td className="px-6 py-4">
                                            {Number(validator.activated_stake).toLocaleString('en-US', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            })}
                                        </td>
                                        <td className="px-6 py-4">&nbsp;</td>
                                        <td className="px-6 py-4 max-w-[70px] text-center">{validator.commission}%</td>
                                        <td className="px-6 py-4">Stake Account</td>
                                        <td className="px-6 py-4">Leader Slots</td>
                                        <td className="px-6 py-4">Leader Slots Done</td>
                                        <td className="px-6 py-4">Leader Slots Skipped</td>
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
                                        <td className="px-6 py-4">ASN Organization</td>
                                        <td className="px-6 py-4">Root Slot</td>
                                        <td className="px-6 py-4">Score</td>
                                        <td className="px-6 py-4">Skip Rate</td>
                                        <td className="px-6 py-4">Status</td>
                                        <td className="px-6 py-4">{validator.superminority === 1 ? 'Yes' : 'No'}</td>
                                        <td className="px-6 py-4">{validator.uptime}</td>
                                        <td className="px-6 py-4">{validator.version}</td>
                                        <td className="px-6 py-4">Vote Success</td>
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
