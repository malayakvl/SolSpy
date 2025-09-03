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
    faStar
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./Partials/ValidatorCredits";
import ValidatorRate from "./Partials/ValidatorRate";
import ValidatorActions from "./Partials/ValidatorActions";
import ValidatorName from "./Partials/ValidatorName";
import ValidatorActivatedStake from "./Partials/ValidatorActivatedStake";
import ValidatorUptime from "./Partials/ValidatorUptime";
import ValidatorScore from "./Partials/ValidatorScore";
import axios from 'axios';
import ValidatorSpyRank from "./Partials/ValidatorSpyRank";
import { perPageSelector } from '../../Redux/Validators/selectors';
import { Link } from "@inertiajs/react";


export default function Index(validatorsData) {
    const [data, setData] = useState<any>(validatorsData.validatorsData);
    const [bannedValidators, setBannedValidators] = useState<number[]>([]);
    const perPage = useSelector(perPageSelector);
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);
    const [dataFetched, setDataFetched] = useState(false);
    const [currentPage, setCurrentPage] = useState(validatorsData.currentPage);
    const [itemsPerPage] = useState(perPage); // Number of items per page
    const [selectAll, setSelectAll] = useState(false);
    
    // Load banned validators from localStorage on component mount
    useEffect(() => {
        const bannedList = JSON.parse(localStorage.getItem('validatorBanned') || '[]');
        setBannedValidators(bannedList);
    }, []);

    // Handle ban toggle from child component
    const handleBanToggle = (validatorId: number, isBanned: boolean) => {
        if (isBanned) {
            // Add to banned list
            setBannedValidators(prev => [...prev, validatorId]);
        } else {
            // Remove from banned list
            setBannedValidators(prev => prev.filter(id => id !== validatorId));
        }
    };

    // Filter out banned validators from the data
    // const filteredData = data.filter(validator => !bannedValidators.includes(validator.id));
    const filteredData = data;

    const handleCheckboxChange = (id) => {
        const updatedData = data.map((row) =>
            row.id === id ? { ...row, isChecked: !row.isChecked } : row
        );
        setData(updatedData);
        // Update selectAll state based on whether all visible (non-banned) rows are checked
        const visibleRows = updatedData.filter(validator => !bannedValidators.includes(validator.id));
        setSelectAll(visibleRows.every((row) => row.isChecked));
    };

    const handleSelectAllChange = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        // Update only visible (non-banned) checkboxes to match the select all state
        const updatedData = data.map((row) => ({
            ...row,
            isChecked: bannedValidators.includes(row.id) ? row.isChecked : newSelectAll
        }));
        setData(updatedData);
    };

    // Pagination logic
    const totalRecords = validatorsData.totalCount; // Use filtered data count
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    // Pagination logic

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            fetchData(pageNumber);
        }
    };

    // Generate page numbers to display (first 5, ..., last 5)
    const getPageNumbers = () => {
        const pages = [];
        const firstPages = 5; // First 5 pages
        const lastPages = 5; // Last 5 pages

        // Add first 5 pages
        for (let i = 1; i <= Math.min(firstPages, totalPages); i++) {
            pages.push(i);
        }

        // Add ellipsis if there are more pages between first 5 and last 5
        if (totalPages > firstPages + lastPages) {
            pages.push('...');
        }

        // Add last 5 pages
        for (let i = Math.max(firstPages + 1, totalPages - lastPages + 1); i <= totalPages; i++) {
            pages.push(i);
        }

        return pages;
    };

    const fetchData = async ( page ) => {
        try {
            const response = await axios.get(`/api/fetch-validators?page=${page || currentPage}`);
            setData(response.data.validatorsData);
            // console.log(`Залишилось: ${days} дн, ${hours} год, ${minutes} хв, ${seconds} сек`);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        // const intervalId = setInterval(fetchData(currentPage), 15000);
        const intervalId = setInterval(() => fetchData(currentPage), 15000);
        return () => clearInterval(intervalId);
    }, [dataFetched])



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
                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 validator-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input 
                                                type="checkbox" 
                                                checked={selectAll}
                                                onChange={handleSelectAllChange} 
                                            />
                                        </th>
                                        <th>Spy Rank</th>
                                        <th>Avatar</th>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>TVC Score</th>
                                        <th>Vote Credits</th>
                                        <th>Active Stake</th>
                                        <th>Vote Rate</th>
                                        <th>Inflation<br/>Commission</th>
                                        <th>MEV<br/>Commission</th>
                                        <th>Uptime</th>
                                        <th>Client/Version</th>
                                        <th>Status SFDP</th>
                                        <th>Location</th>
                                        <th>Awards</th>

                                        <th>Website</th>
                                        <th>City</th>
                                        <th>ASN</th>
                                        <th>IP</th>
                                        <th>Jiito Score</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {currentItems.map((validator, index) => (
                                    <tr>
                                        <td className="text-center">
                                            <input 
                                                type="checkbox" 
                                                id={validator.id} 
                                                checked={validator.isChecked || false}
                                                onChange={() => handleCheckboxChange(validator.id)} 
                                            />
                                        </td>
                                        <td className="text-center">
                                            <ValidatorSpyRank validator={validator} />
                                        </td>
                                        <td className="text-center py-2">
                                            {validator.avatar_file_url ? (
                                                <img
                                                    src={validator.avatar_file_url}
                                                    alt={validator.name}
                                                    style={{ width: "35px", height: "35px", objectFit: "cover", borderRadius: "50%", margin: "0px auto" }}
                                                />
                                            ) : null}
                                        </td>
                                        <td>
                                            <ValidatorName validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            {!validator.delinquent ? (
                                                <FontAwesomeIcon icon={faCheck} className="mr-1" />
                                            ) : (
                                                <FontAwesomeIcon icon={faBan} className="mr-1" />
                                            )}
                                        </td>
                                        <td className="text-center">
                                            <ValidatorScore validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            <ValidatorCredits epoch={epoch} validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            <ValidatorActivatedStake epoch={epoch} validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            <ValidatorRate epoch={epoch} validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            {validator.commission}%
                                        </td>
                                        <td className="text-center">{validator.jito_commission/100}</td>
                                        <td className="text-center">
                                            <ValidatorUptime epoch={epoch} validator={validator} />
                                        </td>
                                        <td className="text-center">
                                            {`${validator.version}  ${validator.software_client || ''}`}
                                        </td>
                                        <td className="text-center">SFDP</td>
                                        <td className="text-left whitespace-nowrap">{validator.country_iso} {validator.country}</td>
                                        <td className="text-center">
                                            <FontAwesomeIcon icon={faStar} className="text-xs" />
                                        </td>
                                        <td className="text-center">
                                            {validator.url ?
                                                <a href={validator.url} target="_blank">{validator.url.slice(0, 4)}...{validator.url.slice(-4)}</a>
                                            : <></>
                                            }
                                        </td>
                                        <td className="text-center">{validator.city}</td>
                                        <td className="text-center">{validator.asn}</td>
                                        <td className="text-center">{validator.ip}</td>
                                        <td className="text-center"> JS </td>
                                        <th className="text-center">
                                            <ValidatorActions validator={validator} onBanToggle={handleBanToggle} />
                                        </th>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        <div className="mt-4 flex justify-center items-center space-x-2 text-[12px]">
                            <button
                                onClick={() => {
                                    paginate(currentPage - 1)
                                }}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 bg-gray-200 text-gray-700 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                            >
                                Previous
                            </button>
                            {getPageNumbers().map((page, index) => (
                                <span key={index}>
                                    {page === '...' ? (
                                        <span className="px-4 py-2 text-gray-700">...</span>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setCurrentPage(page);
                                                paginate(page);
                                            }}
                                            className={`px-4 py-2 rounded ${
                                                Number(currentPage) === page
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                            {page}
                                        </button>
                                    )}
                                </span>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 bg-gray-200 text-gray-700 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
