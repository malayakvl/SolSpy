import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import React, { useEffect, useState, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./ValidatorCredits";
import ValidatorRate from "./ValidatorRate";
import ValidatorActions from "./ValidatorActions";
import ValidatorName from "./ValidatorName";
import ValidatorActivatedStake from "./ValidatorActivatedStake";
import ValidatorUptime from "./ValidatorUptime";
import DataTable from 'react-data-table-component';
import ValidatorScore from "./ValidatorScore";
import axios from 'axios';
import ValidatorSpyRank from "./ValidatorSpyRank";

export default function Index(validatorsData) {
    const [data, setData] = useState<any>(validatorsData.validatorsData);
    const sortData = validatorsData.validatorsAllData;
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);
    const [dataFetched, setDataFetched] = useState(false)

    const [selectAll, setSelectAll] = useState(false);

    const handleCheckboxChange = (id) => {
        // setData((prevData) =>
        //     prevData.map((row) =>
        //         row.id === id ? { ...row, isChecked: !row.isChecked } : row
        //     )
        // );
        // Update selectAll state based on whether all rows are checked
        const updatedData = data.map((row) =>
            row.id === id ? { ...row, isChecked: !row.isChecked } : row
        );
        setSelectAll(updatedData.every((row) => row.isChecked));
    };


    const handleSelectAllChange = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/fetch-validators');
            setData(response.data.validatorsData);
            // console.log(`Залишилось: ${days} дн, ${hours} год, ${minutes} хв, ${seconds} сек`);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        const intervalId = setInterval(fetchData, 15000);
        return () => clearInterval(intervalId);
    }, [dataFetched])

    const columnsN = [
        // {
        //     name: (
        //         <input
        //             type="checkbox"
        //             checked={selectAll}
        //             onChange={handleSelectAllChange}
        //             aria-label="Select all rows"
        //         />
        //     ),
        //     cell: (row) => (
        //         <input
        //             type="checkbox"
        //             checked={row.isChecked || false}
        //             onChange={() => handleCheckboxChange(row.id)}
        //             aria-label={`Select row ${row.id}`}
        //         />
        //     ),
        //     sortable: false,
        //     width: "60px",
        // },
        {
            name: "SpyRank",
            cell: (row) => (
                <ValidatorSpyRank validator={row} />
            ),
            sortable: true,
            width: "100px",
        },
        {
            name: "Avatar",
            cell: (row) => (
                row.avatar_file_url ? (
                    <img
                        src={row.avatar_file_url}
                        alt={row.name}
                        style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}
                    />
                ) : null
            ),
            sortable: false,
            width: "100px",
        },
        {
            name: "Name",
            cell: (row) => (
                <ValidatorName validator={row} />
            ),
            sortable: true,
            width: "260px",
        },
        {
            name: "Status",
            cell: (row) => (
                !row.delinquent ? (
                    <FontAwesomeIcon icon={faCheck} className="mr-1" />
                ) : (
                    <FontAwesomeIcon icon={faBan} className="mr-1" />
                )
            ),
            sortable: true,
            width: "100px",
        },
        {
            name: "TVC Score",
            cell: (row) => (
                <ValidatorScore validators={sortData} validator={row} />
            ),
            sortable: true,
        },
        {
            name: "Vote Rate",
            cell: (row) => (
                <ValidatorRate epoch={epoch} validator={row} />
            ),
            sortable: true,
        },

        {
            name: "Vote Credits",
            cell: (row) => (
                <ValidatorCredits epoch={epoch} validator={row} />
            ),
            sortable: true,
            width: "170px",
        },
        {
            name: "Active Stake",
            cell: (row) => (
                <ValidatorActivatedStake epoch={epoch} validator={row} />
            ),
            sortable: true,
            width: "170px",
        },
        {
            name: "Inflation Commission",
            selector: (row) => `${row.commission}%`,
            sortable: true,
        },
        {
            name: "MEV Commission",
            selector: '',
            sortable: true,
        },
        {
            name: "Uptime",
            cell: (row) => (
                <ValidatorUptime epoch={epoch} validator={row} />
            ),
            sortable: false,
        },
        {
            name: "Client/Version",
            selector: (row) => `${row.version}  ${row.software_client || ''}`,
            sortable: false,
            width: "160px",
        },
        {
            name: "Status SFDP",
            selector: '',
            sortable: true,
        },
        {
            name: "Location",
            selector: (row) => row.country,
            sortable: true,
        },
        {
            name: "Awards",
            selector: '',
            sortable: true,
        },
        {
            name: "Website",
            selector: (row) => row.url,
            sortable: false,
        },
        {
            name: "City",
            selector: (row) => row.city,
            sortable: true,
        },
        {
            name: "ASN",
            selector: (row) => row.asn,
            sortable: true,
        },
        {
            name: "IP",
            selector: (row) => row.ip,
            sortable: true,
        },
        {
            name: "Jito Score",
            selector: '',
            sortable: true,
        },
        {
            name: "Actions",
            cell: (row) => (
                <ValidatorActions validator={row} />
            ),
            sortable: true,
        },
    ];

    const paginationComponentOptions = {
        selectAllRowsItem: true,
        selectAllRowsItemText: "ALL"
    };

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



    const formattedNumData = (val) => {
        return Number(val).toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
    }


    useEffect(() => {
        // fetchVoteAccounts();
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
                            <DataTable
                                columns={columnsN}
                                data={data}
                                pagination
                                paginationComponentOptions={paginationComponentOptions}
                                selectableRows

                            />


                            {/*<table className="min-w-full divide-y divide-gray-200 validator-table">*/}
                            {/*    <thead>*/}
                            {/*    <tr>*/}
                            {/*        <th>&nbsp;</th>*/}
                            {/*        <th>Spy Rank</th>*/}
                            {/*        <th>Avatar</th>*/}
                            {/*        <th>Name</th>*/}
                            {/*        <th>Status</th>*/}
                            {/*        <th>TVC Score</th>*/}
                            {/*        <th>Vote Credits</th>*/}
                            {/*        <th>Active Stake</th>*/}
                            {/*        <th>Inflation Commission</th>*/}
                            {/*        <th>MEV Commission</th>*/}
                            {/*        <th>Uptime</th>*/}
                            {/*        <th>Client/Version</th>*/}
                            {/*        <th>Status SFDP</th>*/}
                            {/*        <th>Location</th>*/}
                            {/*        <th>Awards</th>*/}
                            {/*        <th>Vote Rate</th>*/}
                            {/*        <th>Website</th>*/}
                            {/*        <th>City</th>*/}
                            {/*        <th>ASN</th>*/}
                            {/*        <th>IP</th>*/}
                            {/*        <th>Jiito Score</th>*/}
                            {/*        <th>Actions</th>*/}
                            {/*    </tr>*/}
                            {/*    </thead>*/}
                            {/*    <tbody>*/}
                            {/*    {data.map((validator, index) => (*/}
                            {/*        <tr*/}
                            {/*            key={validator.id} // Унікальний ключ для кожного рядка*/}
                            {/*            className={`${*/}
                            {/*                index % 2 === 0*/}
                            {/*                    ? 'bg-white dark:bg-gray-900'*/}
                            {/*                    : 'bg-gray-50 dark:bg-gray-800'*/}
                            {/*            } border-b dark:border-gray-700 border-gray-200`}*/}
                            {/*        >*/}
                            {/*            <td className="px-6 py-4"><input type="checkbox" /></td>*/}
                            {/*            <td className="px-6 py-4 text-center">SR</td>*/}
                            {/*            <td className="px-6 py-4 text-center w-[50px]">*/}
                            {/*                {validator.avatar_file_url ? (*/}
                            {/*                    <img*/}
                            {/*                        src={validator.avatar_file_url}*/}
                            {/*                        alt={`${validator.name} avatar`}*/}
                            {/*                        className="rounded-full w-[32px] h-[32px] object-cover flex-shrink-0"*/}
                            {/*                        onError={(e) => {*/}
                            {/*                            e.target.src = 'https://via.placeholder.com/32';*/}
                            {/*                        }}*/}
                            {/*                    />*/}
                            {/*                ) : (*/}
                            {/*                    <div className="rounded-full w-[32px] h-[32px] bg-gray-200 dark:bg-gray-600 flex-shrink-0" />*/}
                            {/*                )}*/}
                            {/*            </td>*/}
                            {/*            <td className="px-6 py-4">*/}
                            {/*                <div className="flex flex-col">*/}
                            {/*                    <span className="truncate v-truncate min-w-[190px]">{validator.name}</span>*/}
                            {/*                    <div className="flex items-center space-x-2">*/}
                            {/*                      <span*/}
                            {/*                          className="text-[14px] truncate v-truncate max-w-[150px] hover:underline"*/}
                            {/*                          title={validator.vote_pubkey} // Full vote_pubkey on hover*/}
                            {/*                      >*/}
                            {/*                        {validator.vote_pubkey.slice(0, 4)}...{validator.vote_pubkey.slice(-4)}*/}
                            {/*                      </span>*/}
                            {/*                    </div>*/}
                            {/*                </div>*/}
                            {/*            </td>*/}
                            {/*            <td className="px-6 py-4">{!validator.delinquent ?*/}
                            {/*                <FontAwesomeIcon icon={faCheck} className="mr-1" />*/}
                            {/*                    :*/}
                            {/*                    ''*/}
                            {/*                }*/}
                            {/*            </td>*/}
                            {/*            <td className="px-6 py-4">TVC Score</td>*/}
                            {/*            <td className="px-6 py-4">*/}
                            {/*                <ValidatorCredits validator={validator} />*/}
                            {/*                /!*<ValidatorCredits voteData={validatorData} validator={validator} />*!/*/}
                            {/*            </td>*/}
                            {/*            <td className="px-6 py-4">*/}
                            {/*                {formattedNumData(validator.activated_stake)}*/}
                            {/*                <div className="flex">*/}
                            {/*                    <FontAwesomeIcon icon={faHand} className="mr-1" />*/}
                            {/*                    <FontAwesomeIcon icon={faBomb} className="mr-1" />*/}
                            {/*                    <FontAwesomeIcon icon={faBeer} className="mr-1" />*/}
                            {/*                </div>*/}
                            {/*            </td>*/}
                            {/*            /!*Inflation Commission*!/*/}
                            {/*            <td className="px-6 py-4"> - </td>*/}
                            {/*            /!*MEV Commission*!/*/}
                            {/*            <td className="px-6 py-4"> - </td>*/}
                            {/*            /!*Uptime*!/*/}
                            {/*            <td className="px-6 py-4">{validator.uptime}</td>*/}
                            {/*            /!*Client (з version)*!/*/}
                            {/*            <td className="px-6 py-4">{validator.version}</td>*/}
                            {/*            /!*Статус SFDP*!/*/}
                            {/*            <td className="px-6 py-4"> - </td>*/}
                            {/*            /!*Location*!/*/}
                            {/*            <td className="px-6 py-4">{validator.country}</td>*/}
                            {/*            /!*Awards*!/*/}
                            {/*            <td className="px-6 py-4"> - </td>*/}
                            {/*            /!*Vote Rate*!/*/}
                            {/*            <td className="px-6 py-4"> - </td>*/}
                            {/*            /!*Website*!/*/}
                            {/*            <td className="px-6 py-4">*/}
                            {/*                <a href={validator.url} target="_blank">*/}
                            {/*                    {validator.url.slice(0, 15)}...{validator.url.slice(-9)}*/}
                            {/*                </a>*/}
                            {/*            </td>*/}
                            {/*            /!*City*!/*/}
                            {/*            <td className="px-6 py-4">{validator.city}</td>*/}
                            {/*            /!*ASN*!/*/}
                            {/*            <td className="px-6 py-4">{validator.asn}</td>*/}
                            {/*            <td className="px-6 py-4">{validator.ip}</td>*/}
                            {/*            <td className="px-6 py-4">JS</td>*/}
                            {/*            <td className="px-6 py-4 whitespace-nowrap">*/}
                            {/*                <FontAwesomeIcon icon={faPencil} className="mr-1" />*/}
                            {/*                <FontAwesomeIcon icon={faEye} className="mr-1" />*/}
                            {/*                <FontAwesomeIcon icon={faScaleBalanced} className="mr-1" />*/}
                            {/*                <FontAwesomeIcon icon={faHeart} className="mr-1" />*/}
                            {/*                <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />*/}
                            {/*                <FontAwesomeIcon icon={faBan} />*/}
                            {/*            </td>*/}
                            {/*        </tr>*/}
                            {/*    ))}*/}
                            {/*    </tbody>*/}
                            {/*</table>*/}
                        </div>

                        <div className="overflow-x-auto">
                            {/*<table className="min-w-full divide-y divide-gray-200 validator-table">*/}
                            {/*    <thead>*/}
                            {/*    <tr>*/}
                            {/*        <th>Rank</th>*/}
                            {/*        <th>Name</th>*/}
                            {/*        <th>Last Voted Slot</th>*/}
                            {/*        <th>Vote Credits</th>*/}
                            {/*        <th>Stake</th>*/}
                            {/*        <th>Stake Changes</th>*/}
                            {/*        <th className="text-center">Comission</th>*/}
                            {/*        <th>Stake Account</th>*/}
                            {/*        <th>Leader Slots</th>*/}
                            {/*        <th>Leader Slots Done</th>*/}
                            {/*        <th>Leader Slots Skipped</th>*/}
                            {/*        <th>ASN</th>*/}
                            {/*        <th>Location Coordinates</th>*/}
                            {/*        <th>City</th>*/}
                            {/*        <th>Country</th>*/}
                            {/*        <th>Epoch start</th>*/}
                            {/*        <th>IP</th>*/}
                            {/*        <th>Running Jito</th>*/}
                            {/*        <th>Current Liquid Stake</th>*/}
                            {/*        <th>Changing Liquid Stake</th>*/}
                            {/*        <th>Target Liquid Stake</th>*/}
                            {/*        <th>MEV Commission</th>*/}
                            {/*        <th>ASN Organization</th>*/}
                            {/*        <th>Root Slot</th>*/}
                            {/*        <th>Score</th>*/}
                            {/*        <th>Skip Rate</th>*/}
                            {/*        <th>Status</th>*/}
                            {/*        <th>Superminority</th>*/}
                            {/*        <th>Uptime (30d)</th>*/}
                            {/*        <th>Version</th>*/}
                            {/*        <th>Vote Success</th>*/}
                            {/*    </tr>*/}
                            {/*    </thead>*/}
                            {/*    <tbody>*/}
                            {/*    {data.map((validator, index) => (*/}
                            {/*        <tr*/}
                            {/*            key={validator.id} // Унікальний ключ для кожного рядка*/}
                            {/*            className={`${*/}
                            {/*                index % 2 === 0*/}
                            {/*                    ? 'bg-white dark:bg-gray-900'*/}
                            {/*                    : 'bg-gray-50 dark:bg-gray-800'*/}
                            {/*            } border-b dark:border-gray-700 border-gray-200`}*/}
                            {/*        >*/}
                            {/*            <td className="px-6 py-4 text-center w-[50px]">{validator.rank}</td>*/}
                            {/*            <th*/}
                            {/*                scope="row"*/}
                            {/*                className="min-w-[150px] px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center space-x-3"*/}
                            {/*            >*/}
                            {/*                /!* Validator avatar *!/*/}
                            {/*                {validator.avatar_file_url ? (*/}
                            {/*                    <img*/}
                            {/*                        src={validator.avatar_file_url}*/}
                            {/*                        alt={`${validator.name} avatar`}*/}
                            {/*                        className="rounded-full w-[32px] h-[32px] object-cover flex-shrink-0"*/}
                            {/*                        onError={(e) => {*/}
                            {/*                            e.target.src = 'https://via.placeholder.com/32';*/}
                            {/*                        }}*/}
                            {/*                    />*/}
                            {/*                ) : (*/}
                            {/*                    <div className="rounded-full w-[32px] h-[32px] bg-gray-200 dark:bg-gray-600 flex-shrink-0" />*/}
                            {/*                )}*/}
                            {/*                /!* Name and vote_pubkey with icon *!/*/}
                            {/*                <div className="flex flex-col">*/}
                            {/*                    <span className="truncate v-truncate min-w-[190px]">{validator.name}</span>*/}
                            {/*                    <div className="flex items-center space-x-2">*/}
                            {/*                      <span*/}
                            {/*                          className="text-[11px] text-gray-500 dark:text-blue-400 truncate v-truncate max-w-[150px] hover:underline"*/}
                            {/*                          title={validator.vote_pubkey} // Full vote_pubkey on hover*/}
                            {/*                      >*/}
                            {/*                        {validator.vote_pubkey.slice(0, 4)}...{validator.vote_pubkey.slice(-4)}*/}
                            {/*                      </span>*/}
                            {/*                        <a href={`https://solscan.io/account/${validator.vote_pubkey}`} target="_blank">*/}
                            {/*                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-[12px] h-[12px]" />*/}
                            {/*                        </a>*/}
                            {/*                    </div>*/}
                            {/*                </div>*/}
                            {/*            </th>*/}
                            {/*            <td className="px-6 py-4">{getLastVotedSlot(validator.vote_pubkey)}</td>*/}
                            {/*            <td className="px-6 py-4">*/}
                            {/*                <ValidatorCredits voteData={validatorData} validator={validator} />*/}
                            {/*                /!*<Suspense fallback="Loading...">*!/*/}
                            {/*                /!*    <VoteRate votePubkey={validator.vote_pubkey} identityPubkey={validator.node_pubkey} />*!/*/}
                            {/*                /!*</Suspense>*!/*/}
                            {/*            </td>*/}
                            {/*            <td className="px-6 py-4">*/}
                            {/*                {Number(validator.activated_stake).toLocaleString('en-US', {*/}
                            {/*                    minimumFractionDigits: 0,*/}
                            {/*                    maximumFractionDigits: 0*/}
                            {/*                })}*/}
                            {/*            </td>*/}
                            {/*            <td className="px-6 py-4">Stake Account</td>*/}
                            {/*            <td className="px-6 py-4 max-w-[70px] text-center">{validator.commission}%</td>*/}
                            {/*            <td className="px-6 py-4">Leader Slots</td>*/}
                            {/*            <td className="px-6 py-4">Leader Slots Done</td>*/}
                            {/*            <td className="px-6 py-4">Leader Slots Skipped</td>*/}
                            {/*            <td className="px-6 py-4">&nbsp;</td>*/}
                            {/*            <td className="px-6 py-4">{validator.ip_asn}</td>*/}
                            {/*            <td className="px-6 py-4">{validator.latitude},<br/> {validator.longitude}</td>*/}
                            {/*            <td className="px-6 py-4">{validator.ip_city}<br/>{validator.v_city}</td>*/}
                            {/*            <td className="px-6 py-4">{validator.ip_country}<br/>{validator.v_country}</td>*/}
                            {/*            <td className="px-6 py-4">{validator.start_epoch}</td>*/}
                            {/*            <td className="px-6 py-4">{validator.ip}</td>*/}
                            {/*            <td className="px-6 py-4">Running Jito</td>*/}
                            {/*            <td className="px-6 py-4">Last Voted Slot</td>*/}
                            {/*            <td className="px-6 py-4">Current Liquid Stake</td>*/}
                            {/*            <td className="px-6 py-4">Changing Liquid Stake</td>*/}
                            {/*            <td className="px-6 py-4">Target Liquid Stake</td>*/}
                            {/*            <td className="px-6 py-4">MEV Commission</td>*/}
                            {/*            <td className="px-6 py-4">Root Slot</td>*/}
                            {/*            <td className="px-6 py-4">Root Slot</td>*/}
                            {/*            /!*<td className="px-6 py-4">Score</td>*!/*/}
                            {/*            <td className="px-6 py-4">Skip Rate</td>*/}
                            {/*            <td className="px-6 py-4">Status</td>*/}
                            {/*            <td className="px-6 py-4">{validator.superminority === 1 ? 'Yes' : 'No'}</td>*/}
                            {/*            <td className="px-6 py-4">{validator.uptime}</td>*/}
                            {/*            <td className="px-6 py-4">{validator.version}</td>*/}
                            {/*            <td className="px-6 py-4">&nbsp;</td>*/}
                            {/*        </tr>*/}
                            {/*    ))}*/}
                            {/*    </tbody>*/}
                            {/*</table>*/}

                            {/*<MaterialReactTable table={table} />*/}
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
