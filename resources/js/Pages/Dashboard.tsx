import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngDashboard from '../Lang/Dashboard/translation';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../Redux/Layout/selectors';
import React, { useEffect, useState } from 'react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import MovingGridTable from "../Components/GridResult";
import Example from "../Components/GridResult/Ts";
import { useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import DataTable from 'react-data-table-component';

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

const data = [
    { name: 'John', rank: 1, ip_asn: "AS29405", ip_city: "Bratislava", ip_country: "Slovak Republic", comission: 0, version: '0.703.20300'},
    { name: 'Jane', rank: 2, ip_asn: "AS12703", ip_city: "Edinburgh", ip_country: "United Kingdom", comission: 0, version: '2.3.6'},
];


export default function Dashboard(clinicName) {
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


    const columnsN = [
        {
            name: 'Title',
            selector: row => row.title,
            sortable: true,
        },
        {
            name: 'Year',
            selector: row => row.year,
        },
    ];

    const dataN = [
        {
            id: 1,
            title: 'Beetlejuice',
            year: '1988',
        },
        {
            id: 2,
            title: 'Ghostbusters',
            year: '1984',
        },
    ]

    const table = useMaterialReactTable({
        columns,
        data,
        enableColumnOrdering: true,
        initialState: {
            columnVisibility: {
                asn: false,
                city: false,
                country: false,
                epochStart: false,
                runningJito: false,
                lastVotedSlot: false,
                currentLiquidStake: false,
                changeLiquidStake: false,
                targetLiquidStake: false,
                leaderSlotsSkipped: false,
                locationCoordinated: false,
                mevComission: false,
                asnOrg: false,
                rootSlot: false,
                score: false,
                skipRate: false,
                leaderSlotsDone: false,
                status: false,
                superminority: false,
                uptime: false,
                vesion: false,
                voteSuccess: false,
                ip: false,
            }, // Скрыть колонку 'Age' по умолчанию
        },
    });

    // Функция для переключения видимости колонки 'age'
    const toggleAgeColumn = () => {
        table.getColumn('uptime').toggleVisibility(); // Переключает видимость (true/false)
    };

    // Функция для явного задания видимости
    const showAgeColumn = () => {
        table.setColumnVisibility((prev) => ({
            ...prev,
            uptime: true, // Установить видимость колонки 'age' в true
        }));
    };

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
// console.log('Validators Data', data);

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('dashboard.title')} />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>{msg.get('dashboard.title')}&nbsp;</h2>
                    <button className="btn-submit pl-3" onClick={toggleAgeColumn}>Переключить видимость Age</button>
                    <button className="btn-submit ml-3" onClick={showAgeColumn}>Показать Age</button>
                    <div className="mt-6">
                        <DataTable
                            columns={columnsN}
                            data={dataN}
                        />
                        {/*<MaterialReactTable table={table} />*/}
                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
