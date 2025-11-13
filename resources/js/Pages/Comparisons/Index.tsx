import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector, useDispatch } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import { setFilterAction } from '../../Redux/Validators';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faTrash
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./../Validators/Partials/ValidatorCredits";
import ValidatorRate from "./../Validators/Partials/ValidatorRate";
import ValidatorActivatedStake from "../Validators/Partials/ValidatorActivatedStake";
import ValidatorUptime from "../Validators/Partials/ValidatorUptime";
import ValidatorScore from "../Validators/Partials/ValidatorScore";
import ValidatorSpyRank from '../Validators/Partials/ValidatorSpyRank';
import ValidatorSFDP from '../Validators/Partials/ValidatorSFDP';
import ValidatorStatus from '../Validators/Partials/ValidatorStatus';
import ValidatorJiitoScore from '../Validators/Partials/ValidatorJiitoScore';
import ValidatorTVCScore from '../Validators/Partials/ValidatorTVCScore';
import axios from 'axios';
import { toast } from 'react-toastify';
import { perPageSelector, filterTypeSelector } from '../../Redux/Validators/selectors';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { renderColumnHeader, renderColumnCell } from '../../Components/Validators/ValidatorTableComponents';

// Create a separate component for the validator avatar
const ValidatorAvatar = ({ validator }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
        <>
            {imageError ? (
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500" />
            ) : (
                <img 
                  src={validator.avatar_url || validator.avatar_file_url} 
                  alt={`${validator.name} avatar`} 
                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500"
                  onError={() => setImageError(true)}
                />
            )}
            <div className="pt-2">{validator.name}</div>
        </>
    );
};

export default function Index(validatorsData) {
    const dispatch = useDispatch();
    const [data, setData] = useState<any>(validatorsData.validatorsData);
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

    const epoch = useSelector(appEpochSelector);
    const user = usePage().props.auth.user;
    const [dataFetched, setDataFetched] = useState(false);
    const [currentPage, setCurrentPage] = useState(validatorsData.currentPage);
    const [lastPages, setLastPages] = useState({
        all: validatorsData.currentPage,
        top: 1,
        highlight: 1
    }); // Remember last page for each filter type
    const [sortClickState, setSortClickState] = useState<{column: string, direction: string} | null>(null); // Track sort click state


    const [itemsPerPage] = useState(perPage); // Number of items per page
    const [selectAll, setSelectAll] = useState(false);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [totalRecords, setTotalRecords] = useState(validatorsData.totalCount);
    const [showModal, setShowModal] = useState(false);
    const [columnSettings, setColumnSettings] = useState(null);
    const [columnsConfig, setColumnsConfig] = useState([
        { name: "Spy Rank", show: true },
        { name: "Avatar", show: true },
        { name: "Name", show: true },
        { name: "Status", show: true },
        { name: "TVC Score", show: true },
        { name: "Active Stake", show: true },
        { name: "Vote Credits", show: true },
        { name: "Vote Rate", show: true },
        { name: "Inflation Commission", show: true },
        { name: "MEV Commission", show: true },
        { name: "Uptime", show: true },
        { name: "Client/Version", show: true },
        { name: "Status SFDP", show: true },
        { name: "Location", show: true },
        { name: "Awards", show: true },
        { name: "Website", show: true },
        { name: "City", show: true },
        { name: "ASN", show: true },
        { name: "IP", show: true },
        { name: "Jiito Score", show: true }
    ]);
    

    const addToCompare = async (validatorId) => {
        if (user?.id) {
            // Registered user - use API
            try {
                await axios.post('/api/add-compare', {
                    validatorId: validatorId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                toast.success('Comparison list updated', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event for registered users
                window.dispatchEvent(new CustomEvent('comparisonCountChanged'));
                fetchData();
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to update comparison list', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } else {
            // Unregistered user - use localStorage with max 2 items
            const compareList = JSON.parse(localStorage.getItem('validatorCompare') || '[]');
            
            if (compareList.includes(validatorId)) {
                // Remove from comparison
                const updatedList = compareList.filter(id => id !== validatorId);
                localStorage.setItem('validatorCompare', JSON.stringify(updatedList));
                toast.info('Validator removed from comparison', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                // Dispatch event when removing
                window.dispatchEvent(new CustomEvent('comparisonCountChanged'));
                fetchData();
            } 
        }
    }

    // Get role names as array of strings
    const userRoleNames = user?.roles?.map(role => role.name) || [];
    // Check if user has Admin/Manager role
    const isAdmin = userRoleNames.includes('Admin');
    const isManager = userRoleNames.includes('Manager');

    const filteredData = data;
    useEffect(() => {
        // Set up interval for periodic data fetching
        const intervalId = setInterval(() => {
            fetchData();
        }, parseInt(validatorsData.settingsData.update_interval) * 1000);
        
        return () => {
            clearInterval(intervalId);
        };
    }, []);
    
    // Fetch data when currentPage changes
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
            let url = `/api/${!user ? 'fetch-comparison-validators-public' : 'fetch-comparison-validators'}?page=${currentPageFromUrl}&filterType=${currentFilterType}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
            if (searchParam) {
                url += `&search=${encodeURIComponent(searchParam)}`;
            }
            if (!user) {
                url += `&ids=${localStorage.getItem('validatorCompare') || '[]'}`;
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
    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('validators.title')} />
            <div className="py-0">
                {/* Loading overlay - only shown during pagination and sorting */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-700">Завантаження даних...</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{msg.get('validators.title')}&nbsp;</h2>
                    </div>
                    {data.length > 0 ? (
                        <div className="mt-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full validator-table compare-table">
                                    <thead>
                                        <tr>
                                            <th className="text-left font-semibold">Metrics</th>
                                            {data.map((validator) => (
                                                <th key={validator.id} className="px-4 py-2 text-center font-semibold">
                                                    <div className="flex flex-col items-center">
                                                        <ValidatorAvatar validator={validator} />
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {/* Remove Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">&nbsp;</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                <button 
                                                  onClick={() => addToCompare(validator.id)}
                                                  className="text-red-500 hover:text-red-700 cursor-pointer"
                                                  title="Remove from comparison"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} scale={1.5} color="#ff6347" />
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Spy Rank Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-wihte">Spy Rank</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                <ValidatorSpyRank validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Status Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">Status</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                <ValidatorStatus validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* TVC Score Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-white">TVC Score</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                <ValidatorTVCScore validator={validator} />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Vote Credits Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">Vote Credits</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                <ValidatorCredits validator={validator} epoch={epoch} />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Active Stake Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-white">Active Stake</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                <ValidatorActivatedStake validator={validator} epoch={epoch} />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Vote Rate Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">Vote Rate</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                <ValidatorRate validator={validator} epoch={epoch} settingsData={validatorsData.settingsData} totalStakeData={validatorsData.totalStakeData} />
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Inflation Commission Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-white">Inflation Commission</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.jito_commission !== undefined ? `${(parseFloat(validator.jito_commission) / 100).toFixed(2)}%` : 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* MEV Commission Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">MEV Commission</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.commission !== undefined ? `${parseFloat(validator.commission).toFixed(2)}%` : 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Uptime Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-white">Uptime</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.uptime}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Client/Version Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">Client/Version</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.latestVersion || validator.version || validator.software_version || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Status SFDP Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-white">Status SFDP</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                <ValidatorSFDP validator={validator} epoch={epoch} />
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Location Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">Location</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.country || validator.ip_country || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Awards Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-white">Awards</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.awards || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* Website Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">Website</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.url ?
                                                    <a href={validator.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200">
                                                        {validator.url.slice(0, 4)}...{validator.url.slice(-4)}
                                                    </a>
                                                : '-'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* City Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-white">City</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.city || validator.ip_city || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* ASN Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">ASN</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.autonomous_system_number || validator.ip_asn || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    
                                    {/* IP Row */}
                                    <tr className="bg-[#281f32]">
                                        <td className="font-medium text-white">IP</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.ip || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    {/* Jiito Score Row */}
                                    <tr className="bg-[#595163]">
                                        <td className="font-medium text-white">Jito Score</td>
                                        {data.map((validator) => (
                                            <td key={validator.id} className="text-center">
                                                {validator.jito_commission !== undefined ? parseFloat(validator.jito_commission).toFixed(4) : 'N/A'}
                                            </td>
                                        ))}
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p>Empty list</p>
                    )}
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
