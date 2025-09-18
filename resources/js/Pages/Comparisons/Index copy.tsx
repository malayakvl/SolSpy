import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "../Validators/Partials/ValidatorCredits";
import ValidatorRate from "../Validators/Partials/ValidatorRate";
import ValidatorName from "../Validators/Partials/ValidatorName";
import ValidatorActivatedStake from "../Validators/Partials/ValidatorActivatedStake";
import ValidatorUptime from "../Validators/Partials/ValidatorUptime";
import ValidatorScore from "../Validators/Partials/ValidatorScore";
import ValidatorSFDP from "../Validators/Partials/ValidatorSFDP";
import axios from 'axios';
import ValidatorSpyRank from "../Validators/Partials/ValidatorSpyRank";
import { toast } from 'react-toastify';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import { perPageSelector, filterTypeSelector } from '../../Redux/Validators/selectors';


export default function Index(validatorsData) {
    const [data, setData] = useState<any>(validatorsData.validatorsData);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(validatorsData.currentPage);
    const [bannedValidators, setBannedValidators] = useState<number[]>([]);
    const perPage = useSelector(perPageSelector);
    const appLang = useSelector(appLangSelector);
    const filterTypeDataSelector = validatorsData.filterType || useSelector(filterTypeSelector); // Filter type from props or Redux state
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    // Track if the current data fetch is due to pagination or sorting
    const [isPaginationOrSorting, setIsPaginationOrSorting] = useState(false);

    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const [sortClickState, setSortClickState] = useState<{column: string, direction: string} | null>(null); // Track sort click state
    const [totalRecords, setTotalRecords] = useState(validatorsData.totalCount);

    const epoch = useSelector(appEpochSelector);
    const user = usePage().props.auth.user;
    const [dataFetched, setDataFetched] = useState(false);
    const [lastPages, setLastPages] = useState({
        all: validatorsData.currentPage,
        top: 1,
        highlight: 1
    }); // Remember last page for each filter type

    // Fetch comparison validators on component mount
    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        // Show loading indicator only for pagination and sorting operations
        if (isPaginationOrSorting) {
            setIsLoading(true);
        }
        const favoritesList = JSON.parse(localStorage.getItem('validatorFavorites') || '[]');
        // Get filter value and other parameters from current URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentFilterType = urlParams.get('filterType') || 'all';
        const searchParam = urlParams.get('search') || '';
        const sortColumn = urlParams.get('sortColumn') || 'id';
        const sortDirection = urlParams.get('sortDirection') || 'ASC';
        const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
        try {
            // Build URL with all parameters
            let url = `/api/${!user ? 'fetch-favorite-validators-public' : 'fetch-favorite-validators'}?page=${currentPageFromUrl}&filterType=${currentFilterType}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
            if (searchParam) {
                url += `&search=${encodeURIComponent(searchParam)}`;
            }
            if (!user) {
                url += `&ids=${localStorage.getItem('validatorFavorites') || '[]'}`;
            }
            
            const response = await axios.get(url);
            // console.log('Fetched data:', response.data); // Add this line to debug
            setData(response.data.validatorsData);
            setTotalRecords(response.data.totalCount);
            
            // Mark that we've fetched data at least once
            if (!dataFetched) {
                setDataFetched(true);
            }
            
            // Reset sort click state after data is fetched
            setSortClickState(null);
        } catch (error) {
            console.error('Error:', error);
            // Reset sort click state even if there's an error
            setSortClickState(null);
        } finally {
            // Hide loading indicator after pagination or sorting operations
            if (isPaginationOrSorting) {
                setIsLoading(false);
                // Reset the flag
                setIsPaginationOrSorting(false);
            }
        }
    };
console.log('Data fetched', data)

    const removeFromComparison = async (validatorId: number) => {
        try {
            if (user?.id) {
                // Registered user - use API (TODO: implement remove-compare endpoint)
                // For now, use localStorage as fallback
                const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
                const updatedList = compareList.filter(id => id !== validatorId);
                localStorage.setItem('validatorCompare', JSON.stringify(updatedList));
            } else {
                // Unregistered user - update localStorage
                const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
                const updatedList = compareList.filter(id => id !== validatorId);
                localStorage.setItem('validatorCompare', JSON.stringify(updatedList));
            }
            
            // Remove from local state
            setComparisonValidators(prev => prev.filter(validator => validator.id !== validatorId));
            
            toast.success('Validator removed from comparison', {
                position: "top-right",
                autoClose: 2000,
            });
        } catch (error) {
            console.error('Error removing validator from comparison:', error);
            toast.error('Failed to remove validator from comparison');
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout header={<Head />}>
                <Head title="Validator Comparison" />
                <div className="py-0">
                    <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                        <h2>Loading comparison...</h2>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    if (data.length === 0) {
        return (
            <AuthenticatedLayout header={<Head />}>
                <Head title="Validator Comparison" />
                <div className="py-0">
                    <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                        <h2>Validator Comparison</h2>
                        <div className="mt-6">
                            <p className="text-gray-600">No validators selected for comparison.</p>
                            <p className="text-sm text-gray-500 mt-2">Go to the validators page and add some validators to compare.</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title="Validator Comparison" />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>Validator Comparison ({data.length} validators)</h2>
                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            


                            <table className="min-w-full divide-y divide-gray-200 validator-table">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold">Metric</th>
                                        {data.map((validator) => (
                                            <th key={validator.id} className="px-4 py-2 text-center font-semibold">
                                                <div className="flex flex-col items-center space-y-2">
                                                    {validator.avatar_file_url ? (
                                                        <img
                                                            src={validator.avatar_file_url}
                                                            alt={validator.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                                    )}
                                                    <div className="text-sm">
                                                        <ValidatorName validator={validator} align={'center'} />
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Remove Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Remove</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <button 
                                                    onClick={() => removeFromComparison(validator.id)}
                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                    title="Remove from comparison"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Spy Rank Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Spy Rank</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.spyRank}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Status Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Status</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {!validator.delinquent ? (
                                                    <FontAwesomeIcon icon={faCheck} className="mr-1 text-green-500" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faBan} className="mr-1 text-red-500" />
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* TVC Score Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">TVC Score</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorScore validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Vote Credits Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Vote Credits</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorCredits epoch={epoch} validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Active Stake Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Active Stake</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorActivatedStake epoch={epoch} validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Vote Rate Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Vote Rate</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {/* <ValidatorRate epoch={epoch} validator={validator} /> */}
                                                <ValidatorRate validator={validator} epoch={validatorsData.settingsData.epoch} settingsData={validatorsData.settingsData} totalStakeData={validatorsData.totalStakeData} />

                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Inflation Commission Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Inflation Commission</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.commission}%
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* MEV Commission Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">MEV Commission</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.commission !== null && validator.commission !== undefined ? `${validator.commission}%` : 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Uptime Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Uptime</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorUptime epoch={epoch} validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Client/Version Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Client/Version</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {`${validator.version} ${validator.software_client || ''}`}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Status SFDP Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Status SFDP</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                <ValidatorSFDP validator={validator} epoch={epoch} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Location Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Location</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.country}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Awards Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">Awards</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                Awards
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Website Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Website</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.url ?
                                                    <a href={validator.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                                        {validator.url.slice(0, 4)}...{validator.url.slice(-4)}
                                                    </a>
                                                : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* City Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">City</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.city || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* ASN Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">ASN</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.asn || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* IP Row */}
                                    <tr className="border-b bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">IP</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.ip || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Jiito Score Row */}
                                    <tr className="border-b">
                                        <td className="px-4 py-3 font-medium text-gray-900">Jiito Score</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="px-4 py-3 text-center">
                                                {validator.jito_commission !== null && validator.jito_commission !== undefined ? `${validator.jito_commission}%` : 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Summary section */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Comparison Summary</h3>
                            <p className="text-sm text-gray-600">
                                Comparing {data.length} validator{data.length !== 1 ? 's' : ''}. 
                                {!user?.id && ' (Guest mode: max 2 validators)'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}