import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../../Lang/Validators/translation';
import { useSelector, useDispatch } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../../Redux/Layout/selectors';
import { setFilterAction } from '../../../Redux/Validators/actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faStar,
    faGear,
    faSortUp,
    faSortDown
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "../Partials/ValidatorCredits";
import ValidatorRate from "../Partials/ValidatorRate";
import ValidatorActions from "../Partials/ValidatorActions";
import ValidatorName from "../Partials/ValidatorName";
import ValidatorActivatedStake from "../Partials/ValidatorActivatedStake";
import ValidatorUptime from "../Partials/ValidatorUptime";
import ValidatorScore from "../Partials/ValidatorScore";
import axios from 'axios';
import { toast } from 'react-toastify';
import ValidatorSpyRank from "../Partials/ValidatorSpyRank";
import { perPageSelector, filterTypeSelector } from '../../../Redux/Validators/selectors';
import { Link } from "@inertiajs/react";
import { userSelector } from '../../../Redux/Users/selectors';
import Modal from '../Partials/ColumnsModal';
import ValidatorFilters from './Filters';
import ValidatorPagination from './Pagination';
import ValidatorAdminActions from './Actions';

export default function AdminIndex(validatorsData) {
    const dispatch = useDispatch();
    const [data, setData] = useState<any>(validatorsData.validatorsData);
    const [bannedValidators, setBannedValidators] = useState<number[]>([]);
    const perPage = useSelector(perPageSelector);
    const appLang = useSelector(appLangSelector);
    const filterTypeDataSelector = validatorsData.filterType || useSelector(filterTypeSelector); // Filter type from props or Redux state

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
    const [columnsConfig, setColumnsConfig] = useState(() => {
        if (validatorsData.settingsData?.table_fields) {
            const parsedFields = JSON.parse(validatorsData.settingsData.table_fields);
            // Fix any instances of "MEV Comission" to "MEV Commission"
            return parsedFields.map(field => 
                field.name === "MEV Comission" ? {...field, name: "MEV Commission"} : field
            );
        } else {
            return [
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
            ];
        }
    });

    // Get role names as array of strings
    const userRoleNames = user?.roles?.map(role => role.name) || [];
    // Check if user has Admin/Manager role
    const isAdmin = userRoleNames.includes('Admin');
    const isManager = userRoleNames.includes('Manager');

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
        if (checkedIds.includes(id)) {
            // Remove from checkedIds
            setCheckedIds(prev => prev.filter(checkedId => checkedId !== id));
        } else {
            // Add to checkedIds
            setCheckedIds(prev => [...prev, id]);
        }
        
        // Update selectAll state based on whether all visible (non-banned) rows are checked
        const visibleValidatorIds = filteredData
            .filter(validator => !bannedValidators.includes(validator.id))
            .map(validator => validator.id);
        
        const newCheckedIds = checkedIds.includes(id) 
            ? checkedIds.filter(checkedId => checkedId !== id)
            : [...checkedIds, id];
            
        setSelectAll(visibleValidatorIds.every(validatorId => newCheckedIds.includes(validatorId)));
    };

    const handleSelectAllChange = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        
        // Get visible (non-banned) validator IDs
        const visibleValidatorIds = filteredData
            .filter(validator => !bannedValidators.includes(validator.id))
            .map(validator => validator.id);
        
        if (newSelectAll) {
            // Add all visible validator IDs to checkedIds
            setCheckedIds(prev => {
                const newCheckedIds = [...prev];
                visibleValidatorIds.forEach(id => {
                    if (!newCheckedIds.includes(id)) {
                        newCheckedIds.push(id);
                    }
                });
                return newCheckedIds;
            });
        } else {
            // Remove all visible validator IDs from checkedIds
            setCheckedIds(prev => prev.filter(id => !visibleValidatorIds.includes(id)));
        }
    };

    // Pagination logic - server-side
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
            // Update URL with new page number immediately
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('page', pageNumber.toString());
            
            // Only add filterType if it's not 'all' (default)
            if (filterTypeDataSelector !== 'all') {
                urlParams.set('filterType', filterTypeDataSelector);
            }
            
            // Update the browser URL
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState({}, '', newUrl);
            
            // Update currentPage state
            // This will trigger the useEffect to fetch data
            setCurrentPage(pageNumber);
            
            // Save the current page for the current filter
            setLastPages(prev => ({
                ...prev,
                [filterTypeDataSelector]: pageNumber
            }));
        }
    };

    useEffect(() => {
        // const intervalId = setInterval(fetchData(currentPage), 15000);
        
        const intervalId = setInterval(() => {
            // Get current page from URL to ensure we're using the latest page
            const urlParams = new URLSearchParams(window.location.search);
            const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
            fetchData();
        }, parseInt(validatorsData.settingsData.update_interval)*1000);
        
        // Listen for filter changes
        const handleFilterChange = () => {
            // Reset to first page when filter changes
            setCurrentPage(1);
        };
        
        window.addEventListener('filterChanged', handleFilterChange);
        
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('filterChanged', handleFilterChange);
        };
    }, []);
    
    // Add useEffect to fetch data when currentPage changes
    useEffect(() => {
        fetchData();
    }, [currentPage]);
    
    // Add useEffect to fetch data when sort parameters change
    useEffect(() => {
        const handleUrlChange = () => {
            fetchData();
        };
        
        // Listen for URL changes
        window.addEventListener('popstate', handleUrlChange);
        
        // Check if URL has changed on component mount
        handleUrlChange();
        
        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, [window.location.search]);

    // Helper function to get ordered visible columns
    const getOrderedVisibleColumns = () => {
        const filtered = columnsConfig.filter(col => col.show);
        console.log('Filtering columns:', columnsConfig);
        console.log('Filtered columns:', filtered);
        return filtered;
    };

    // Helper function to render column header by name
    const renderColumnHeader = (columnName) => {
        // Map column names to sort keys
        const columnSortKeys = {
            "Name": "name",
            "Status": "status",
            "Spy Rank": "spy_rank",
            "TVC Score": "tvc_score",
            "TVC Rank": "tvc_rank", // Add TVC Rank sorting
            "Vote Credits": "vote_credits",
            "Active Stake": "active_stake",
            "Vote Rate": "vote_rate",
            "Inflation Commission": "inflation_commission",
            "MEV Commission": "mev_commission", // Fixed typo from "comission" to "mev_commission"
            "Uptime": "uptime",
            "Client/Version": "client_version",
            "Status SFDP": "status_sfdp",
            "Location": "location",
            "Awards": "awards",
            "Website": "website",
            "City": "city",
            "ASN": "asn",
            "IP": "ip",
            "Jito Score": "jito_score"
        };

        // Get sort key for this column
        const sortKey = columnSortKeys[columnName];
        
        // Get current sort parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentSortColumn = urlParams.get('sortColumn') || 'id';
        const currentSortDirection = urlParams.get('sortDirection') || 'ASC';
        
        // Handle sort click
        const handleSort = (direction) => {
            // Set sort click state for immediate visual feedback
            setSortClickState({column: sortKey, direction});
            
            // Update URL with sort parameters
            const newUrlParams = new URLSearchParams(window.location.search);
            newUrlParams.set('sortColumn', sortKey);
            newUrlParams.set('sortDirection', direction);
            
            // Update the browser URL
            const newUrl = `${window.location.pathname}?${newUrlParams.toString()}`;
            window.history.replaceState({}, '', newUrl);
            
            // Reset to first page when sorting changes
            // Update URL with new page number
            newUrlParams.set('page', '1');
            const newUrlWithPage = `${window.location.pathname}?${newUrlParams.toString()}`;
            window.history.replaceState({}, '', newUrlWithPage);
            
            // Update currentPage state
            // This will trigger the useEffect to fetch data
            setCurrentPage(1);
        };

        switch(columnName) {
            case "Spy Rank": 
                return (
                    <th key="spy-rank" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Spy Rank</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'spy_rank' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'spy_rank' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'spy_rank' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'spy_rank' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Avatar": return <th key="avatar">Avatar</th>;
            case "Name": 
                return (
                    <th key="name" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Name</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'name' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'name' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'name' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'name' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Status": 
                return (
                    <th key="status" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Status</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'status' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'status' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'status' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'status' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "TVC Score": 
                return (
                    <th key="tvc-score" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>TVC Score</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'tvc_score' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'tvc_score' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'tvc_score' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'tvc_score' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "TVC Rank": 
                return (
                    <th key="tvc-rank" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>TVC Rank</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'tvc_rank' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'tvc_rank' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'tvc_rank' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'tvc_rank' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Vote Credits": 
                return (
                    <th key="vote-credits" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Vote Credits</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'vote_credits' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'vote_credits' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'vote_credits' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'vote_credits' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Active Stake": 
                return (
                    <th key="active-stake" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Active Stake</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'active_stake' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'active_stake' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'active_stake' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'active_stake' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Vote Rate": 
                return (
                    <th key="vote-rate" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Vote Rate</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'vote_rate' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'vote_rate' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'vote_rate' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'vote_rate' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Inflation Commission": 
                return (
                    <th key="inflation-commission" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Inflation<br/>Commission</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'inflation_commission' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'inflation_commission' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'inflation_commission' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'inflation_commission' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "MEV Commission": 
                return (
                    <th key="mev-commission" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>MEV<br/>Commission</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'mev_commission' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'mev_commission' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'mev_commission' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'mev_commission' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Uptime": 
                return (
                    <th key="uptime" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Uptime</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'uptime' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'uptime' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'uptime' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'uptime' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Client/Version": 
                return (
                    <th key="client-version" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Client/Version</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'client_version' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'client_version' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'client_version' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'client_version' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Status SFDP": 
                return (
                    <th key="status-sfdp" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Status SFDP</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'status_sfdp' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'status_sfdp' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'status_sfdp' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'status_sfdp' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Location": 
                return (
                    <th key="location" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Location</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'location' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'location' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'location' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'location' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Awards": 
                return (
                    <th key="awards" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Awards</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'awards' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'awards' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'awards' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'awards' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Website": 
                return (
                    <th key="website" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>Website</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'website' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'website' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'website' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'website' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "City": 
                return (
                    <th key="city" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>City</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'city' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'city' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'city' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'city' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "ASN": 
                return (
                    <th key="asn" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>ASN</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'asn' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'asn' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'asn' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'asn' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "IP": 
                return (
                    <th key="ip" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>IP</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'ip' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'ip' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'ip' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'ip' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            case "Jiito Score": 
                return (
                    <th key="jiito-score" className="cursor-pointer">
                        <div className="flex items-center justify-between">
                            <span>JS</span>
                            <div className="flex flex-col ml-2">
                                <FontAwesomeIcon 
                                    icon={faSortUp} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'jiito_score' && currentSortDirection === 'ASC') || 
                                        (sortClickState && sortClickState.column === 'jiito_score' && sortClickState.direction === 'ASC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('ASC')}
                                />
                                <FontAwesomeIcon 
                                    icon={faSortDown} 
                                    className={`text-xs cursor-pointer hover:text-blue-500 ${
                                        (currentSortColumn === 'jiito_score' && currentSortDirection === 'DESC') || 
                                        (sortClickState && sortClickState.column === 'jiito_score' && sortClickState.direction === 'DESC') 
                                        ? 'text-blue-500' : 'text-gray-400'
                                    }`} 
                                    onClick={() => handleSort('DESC')}
                                />
                            </div>
                        </div>
                    </th>
                );
            default: return null;
        }
    };

    // Helper function to render column cell by name
    const renderColumnCell = (columnName, validator, index) => {
        switch(columnName) {
            case "Spy Rank": 
                return <td key="spy-rank" className="text-center"><ValidatorSpyRank validator={validator} /></td>;
            case "Avatar": 
                return (
                    <td key="avatar" className="text-center py-2">
                        {validator.avatar_file_url ? (
                            <div className="relative inline-block">
                                <img
                                    src={validator.avatar_file_url}
                                    alt={validator.name}
                                    style={{ width: "35px", height: "35px", objectFit: "cover", borderRadius: "50%", margin: "0px auto" }}
                                    onError={({ currentTarget }) => {
                                        currentTarget.onerror = null; // Prevents infinite loop
                                        currentTarget.style.display = 'none'; // Hide the image if it fails to load
                                        // Show the fallback circle
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-[35px] h-[35px] rounded-full bg-gray-200 border-2 border-dashed border-gray-400 mx-auto';
                                        currentTarget.parentNode?.appendChild(fallback);
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-[35px] h-[35px] rounded-full bg-gray-200 border-2 border-dashed border-gray-400 mx-auto"></div>
                        )}
                    </td>
                );
            case "Name": 
                return <td key="name"><ValidatorName validator={validator} /></td>;
            case "Status": 
                return (
                    <td key="status" className="text-center">
                        {!validator.delinquent ? (
                            <FontAwesomeIcon icon={faCheck} className="mr-1" />
                        ) : (
                            <FontAwesomeIcon icon={faBan} className="mr-1" />
                        )}
                    </td>
                );
            case "TVC Score": 
                return <td key="tvc-score" className="text-center"><ValidatorScore validator={validator} /></td>;
            case "TVC Rank": 
                return <td key="tvc-rank" className="text-center">{validator.tvcRank}</td>;
            case "Vote Credits": 
                return <td key="vote-credits" className="text-center">
                    {/* <ValidatorCredits epoch={epoch} validator={validator} /> */}
                    <ValidatorRate epoch={epoch} validator={validator} />
                </td>;
            case "Active Stake": 
                return <td key="active-stake" className="text-center"><ValidatorActivatedStake epoch={epoch} validator={validator} /></td>;
            case "Vote Rate": 
                return <td key="vote-rate" className="text-center">
                    {/* <ValidatorRate epoch={epoch} validator={validator} /> */}
                    </td>;
            case "Inflation Commission": 
                return <td key="inflation-commission" className="text-center">{validator.jito_commission !== null && validator.jito_commission !== undefined ? `${validator.jito_commission/10}%` : 'N/A'}</td>;
            case "MEV Commission": 
                return <td key="mev-commission" className="text-center">{validator.commission !== null && validator.commission !== undefined ? `${validator.commission}%` : 'N/A'}</td>;
            case "Uptime": 
                return <td key="uptime" className="text-center"><ValidatorUptime epoch={epoch} validator={validator} /></td>;
            case "Client/Version": 
                return <td key="client-version" className="text-center">{`${validator.version}  ${validator.software_client || ''}`}</td>;
            case "Status SFDP": 
                return <td key="status-sfdp" className="text-center">SFDP</td>;
            case "Location": 
                return <td key="location" className="text-left whitespace-nowrap">{validator.country_iso} {validator.country}</td>;
            case "Awards": 
                return (
                    <td key="awards" className="text-center">
                        <FontAwesomeIcon icon={faStar} className="text-xs" />
                        <FontAwesomeIcon icon={faStar} className="text-xs" />
                        <FontAwesomeIcon icon={faStar} className="text-xs" />
                    </td>
                );
            case "Website": 
                return (
                    <td key="website" className="text-center">
                        {validator.url ?
                            <a href={validator.url} target="_blank">{validator.url.slice(0, 4)}...{validator.url.slice(-4)}</a>
                        : <></>
                        }
                    </td>
                );
            case "City": 
                return <td key="city" className="text-center">{validator.city}</td>;
            case "ASN": 
                return <td key="asn" className="text-center">{validator.asn}</td>;
            case "IP": 
                return <td key="ip" className="text-center">{validator.ip}</td>;
            case "Jiito Score": 
                return <td key="jiito-score" className="text-center"> JS </td>;
            default: return null;
        }
    };

    const fetchColumnSettings = async () => {
        try {
            const response = await axios.get('/api/settings/columns');
            if (response.data && response.data.table_fields) {
                const freshColumns = JSON.parse(response.data.table_fields);
                // Fix any instances of "MEV Comission" to "MEV Commission"
                const normalizedColumns = freshColumns.map(field => 
                    field.name === "MEV Comission" ? {...field, name: "MEV Commission"} : field
                );
                setColumnsConfig(normalizedColumns);
            }
        } catch (error) {
            console.error('Error fetching column settings:', error);
        }
    };

    const toggleModal = async () => {
        if (!showModal) {
            // Fetch fresh data before opening modal
            await fetchColumnSettings();
        }
        setShowModal(!showModal); // Toggles the state
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    
    const handleColumnSettingsSave = async (columns) => {
        // Fix any instances of "MEV Comission" back to the correct spelling before saving
        const normalizedColumns = columns.map(field => 
            field.name === "MEV Comission" ? {...field, name: "MEV Commission"} : field
        );
        
        setColumnSettings(normalizedColumns);
        try {
            await axios.post('/api/settings/update', {
                columns: normalizedColumns
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            setShowModal(false);
            toast.success('Column settings saved successfully!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to save column settings');
        }
    };

    const fetchData = async () => {
        // Get filter value and other parameters from current URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentFilterType = urlParams.get('filterType') || 'all';
        const searchParam = urlParams.get('search') || '';
        const sortColumn = urlParams.get('sortColumn') || 'id';
        const sortDirection = urlParams.get('sortDirection') || 'ASC';
        const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
        
        try {
            // Build URL with all parameters
            let url = `/api/fetch-validators?page=${currentPageFromUrl}&filterType=${currentFilterType}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
            if (searchParam) {
                url += `&search=${encodeURIComponent(searchParam)}`;
            }
            
            const response = await axios.get(url);
            setData(response.data.validatorsData);
            setTotalRecords(response.data.totalCount);
            
            // Reset sort click state after data is fetched
            setSortClickState(null);
        } catch (error) {
            console.error('Error:', error);
            // Reset sort click state even if there's an error
            setSortClickState(null);
        }
    };

    useEffect(() => {
        // const intervalId = setInterval(fetchData(currentPage), 15000);
        
        const intervalId = setInterval(() => {
            // Get current page from URL to ensure we're using the latest page
            const urlParams = new URLSearchParams(window.location.search);
            const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
            fetchData();
        }, parseInt(validatorsData.settingsData.update_interval)*1000);
        
        // Listen for filter changes
        const handleFilterChange = () => {
            // Reset to first page when filter changes
            setCurrentPage(1);
        };
        
        window.addEventListener('filterChanged', handleFilterChange);
        
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('filterChanged', handleFilterChange);
        };
    }, []);
    
    // Add useEffect to fetch data when currentPage changes
    useEffect(() => {
        fetchData();
    }, [currentPage]);
    
    // Add useEffect to fetch data when sort parameters change
    useEffect(() => {
        const handleUrlChange = () => {
            fetchData();
        };
        
        // Listen for URL changes
        window.addEventListener('popstate', handleUrlChange);
        
        // Check if URL has changed on component mount
        handleUrlChange();
        
        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, []);

    const handleFilterChange = (newFilterValue: string) => {
        // Save current page for current filter before switching
        setLastPages(prev => ({
            ...prev,
            [filterTypeDataSelector]: currentPage
        }));
        
        // Get the saved page for the new filter
        const savedPage = lastPages[newFilterValue] || 1;
        
        dispatch(setFilterAction(newFilterValue));
        
        // Update URL with new filter and page
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('filterType', newFilterValue);
        urlParams.set('page', savedPage.toString());
        
        // Update the browser URL
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
        
        // Update currentPage state
        // This will trigger the useEffect to fetch data
        setCurrentPage(savedPage);
    };

    // Listen for URL changes to trigger data refresh
    useEffect(() => {
        const handleUrlChange = () => {
            // Get parameters from URL
            const urlParams = new URLSearchParams(window.location.search);
            const pageParam = parseInt(urlParams.get('page')) || 1;
            const filterParam = urlParams.get('filterType') || 'all';
            
            // Update state if page has changed
            if (pageParam !== currentPage) {
                setCurrentPage(pageParam);
            }
            
            // Update filter if it has changed
            if (filterParam !== filterTypeDataSelector) {
                dispatch(setFilterAction(filterParam));
            }
            
            // Fetch data
            fetchData();
        };
        
        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', handleUrlChange);
        
        // Check if URL has changed on component mount
        handleUrlChange();
        
        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, []);

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('validators.title')} />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">{msg.get('validators.title')}&nbsp;</h2>
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                            <ValidatorFilters 
                                filterType={filterTypeDataSelector}
                                onFilterChange={handleFilterChange}
                                isAdmin={isAdmin}
                                onGearClick={toggleModal}
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 validator-table">
                                <thead>
                                    <tr>
                                        <th className="relative">
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectAll}
                                                    onChange={handleSelectAllChange} 
                                                />
                                                {isAdmin && (
                                                    <ValidatorAdminActions 
                                                        checkedIds={checkedIds}
                                                        onActionComplete={() => {
                                                            // Refresh data after action
                                                            fetchData(currentPage);
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </th>
                                        <th>Actions</th>
                                        {getOrderedVisibleColumns().map(column => renderColumnHeader(column.name))}
                                    </tr>
                                </thead>
                                <tbody>
                                {data.map((validator, index) => (
                                    <tr key={validator.id}>
                                        <td className="text-left">
                                            <div className="pl-[10px]">
                                                <input 
                                                    type="checkbox" 
                                                    id={validator.id} 
                                                    checked={checkedIds.includes(validator.id)}
                                                    onChange={() => handleCheckboxChange(validator.id)} 
                                                />
                                            </div>
                                        </td>
                                        <th className="text-center">
                                            <ValidatorActions validator={validator} onBanToggle={handleBanToggle} />
                                        </th>
                                        {getOrderedVisibleColumns().map(column => renderColumnCell(column.name, validator, index))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <ValidatorPagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            filterType={filterTypeDataSelector}
                            onPageChange={handlePageChange}
                        />
                        
                        {(showModal && isAdmin) && (
                            <Modal 
                                onClose={closeModal} 
                                onSave={(columns) => {
                                    // Normalize column names before saving
                                    const normalizedColumns = columns.map(field => 
                                        field.name === "MEV Comission" ? {...field, name: "MEV Commission"} : field
                                    );
                                    handleColumnSettingsSave(normalizedColumns);
                                }}
                                initialColumns={columnsConfig}
                                onColumnChange={(columnName, isVisible, index, updatedList) => {
                                    // Update the columns configuration
                                    setColumnsConfig(updatedList);
                                }}
                                onSort={(newList) => {
                                    // Update the columns configuration
                                    setColumnsConfig(newList);
                                }}
                            >
                                {/* Modal Content */}
                            </Modal>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}