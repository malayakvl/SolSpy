import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector, useDispatch } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import { setFilterAction } from '../../Redux/Validators/actions';
import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faStar,
    faChevronDown,
    faGear
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./Partials/ValidatorCredits";
import ValidatorRate from "./Partials/ValidatorRate";
import ValidatorActions from "./Partials/ValidatorActions";
import ValidatorName from "./Partials/ValidatorName";
import ValidatorActivatedStake from "./Partials/ValidatorActivatedStake";
import ValidatorUptime from "./Partials/ValidatorUptime";
import ValidatorScore from "./Partials/ValidatorScore";
import axios from 'axios';
import { toast } from 'react-toastify';
import ValidatorSpyRank from "./Partials/ValidatorSpyRank";
import { perPageSelector, filterTypeSelector } from '../../Redux/Validators/selectors';
import { Link } from "@inertiajs/react";
import { userSelector } from '../../Redux/Users/selectors';
import { fetchUpdatedValidators } from '../../Redux/Validators/index';
import Modal from './Partials/ColumnsModal';


export default function Index(validatorsData) {
    const dispath = useDispatch();
    const [data, setData] = useState<any>(validatorsData.validatorsData);
    const [bannedValidators, setBannedValidators] = useState<number[]>([]);
    const perPage = useSelector(perPageSelector);
    const appLang = useSelector(appLangSelector);
    const filterTypeDataSelector = useSelector(filterTypeSelector); // Filter type from Redux state
    
    // Debug logs to track when component re-renders and Redux state
    
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
    const [itemsPerPage] = useState(perPage); // Number of items per page
    const [selectAll, setSelectAll] = useState(false);
    const [showAdminDropdown, setShowAdminDropdown] = useState(false);
    const [filterTypeValue, setFilterTypeValue] = useState(filterTypeDataSelector);
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
        { name: "Vote Credits", show: true },
        { name: "Active Stake", show: true },
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

    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            // Save the current page for the current filter
            setLastPages(prev => ({
                ...prev,
                [filterTypeDataSelector]: pageNumber
            }));
            
            // Update URL with new page number
            const params = { page: pageNumber };
            // Only add filterType if it's not 'all' (default)
            if (filterTypeDataSelector !== 'all') {
                params.filterType = filterTypeDataSelector;
            }
            
            router.get('/validators', params, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['validatorsData', 'totalCount'],
                onSuccess: (page) => {
                    setData(page.props.validatorsData);
                    setTotalRecords(page.props.totalCount);
                }
            });
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

    // Helper function to check if column should be visible
    const isColumnVisible = (columnName) => {
        const column = columnsConfig.find(col => col.name === columnName);
        return column ? column.show : true;
    };

    // Helper function to get ordered visible columns
    const getOrderedVisibleColumns = () => {
        return columnsConfig.filter(col => col.show);
    };

    // Helper function to render column header by name
    const renderColumnHeader = (columnName) => {
        switch(columnName) {
            case "Spy Rank": return <th key="spy-rank">Spy Rank</th>;
            case "Avatar": return <th key="avatar">Avatar</th>;
            case "Name": return <th key="name">Name</th>;
            case "Status": return <th key="status">Status</th>;
            case "TVC Score": return <th key="tvc-score">TVC Score</th>;
            case "Vote Credits": return <th key="vote-credits">Vote Credits</th>;
            case "Active Stake": return <th key="active-stake">Active Stake</th>;
            case "Vote Rate": return <th key="vote-rate">Vote Rate</th>;
            case "Inflation Commission": return <th key="inflation-commission">Inflation<br/>Commission</th>;
            case "MEV Commission": return <th key="mev-commission">MEV<br/>Commission</th>;
            case "Uptime": return <th key="uptime">Uptime</th>;
            case "Client/Version": return <th key="client-version">Client/Version</th>;
            case "Status SFDP": return <th key="status-sfdp">Status SFDP</th>;
            case "Location": return <th key="location">Location</th>;
            case "Awards": return <th key="awards">Awards</th>;
            case "Website": return <th key="website">Website</th>;
            case "City": return <th key="city">City</th>;
            case "ASN": return <th key="asn">ASN</th>;
            case "IP": return <th key="ip">IP</th>;
            case "Jiito Score": return <th key="jiito-score">Jiito Score</th>;
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
                            <img
                                src={validator.avatar_file_url}
                                alt={validator.name}
                                style={{ width: "35px", height: "35px", objectFit: "cover", borderRadius: "50%", margin: "0px auto" }}
                            />
                        ) : null}
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
            case "Vote Credits": 
                return <td key="vote-credits" className="text-center"><ValidatorCredits epoch={epoch} validator={validator} /></td>;
            case "Active Stake": 
                return <td key="active-stake" className="text-center"><ValidatorActivatedStake epoch={epoch} validator={validator} /></td>;
            case "Vote Rate": 
                return <td key="vote-rate" className="text-center"><ValidatorRate epoch={epoch} validator={validator} /></td>;
            case "Inflation Commission": 
                return <td key="inflation-commission" className="text-center">{validator.commission}%</td>;
            case "MEV Commission": 
                return <td key="mev-commission" className="text-center">{validator.jito_commission ? `${ validator.jito_commission/100}%` : ''}</td>;
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

    const toggleModal = () => {
      setShowModal(!showModal); // Toggles the state
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    
    const handleColumnSettingsSave = (columns) => {
        setColumnSettings(columns);
        // Optionally refresh data with new column settings
        // fetchData(currentPage);
    };


    const addMarkToValidators = (value) => {
        router.get(`/mark-validators`, {
            value: value,
            checkedIds: checkedIds
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['validatorsData'],
            onSuccess: (page) => {
                setData(page.props.validatorsData);
                toast.success(`Validator ${value} status  updated successfully!`);
            },
            onError: (error) => {
                console.error('Error:', error);
            }
        });
    }


    const fetchData = async ( page, filterValue = 'all' ) => {
        // Get filter value and page from current URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentFilterType = urlParams.get('filterType') || 'all';
        const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
        
        try {
            const response = await axios.get(`/api/fetch-validators?page=${currentPageFromUrl}&filterType=${currentFilterType}`);
            setData(response.data.validatorsData);
        } catch (error) {
            console.error('Error:', error);
        }
    };


    useEffect(() => {
        // const intervalId = setInterval(fetchData(currentPage), 15000);
        const intervalId = setInterval(() => fetchData(currentPage), 15000);
        return () => clearInterval(intervalId);
    }, [dataFetched])


    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('validators.title')} />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                    <h2>{msg.get('validators.title')}&nbsp;</h2>
                    <div className="flex justify-between"> 
                        <input className="w-full sm:w-1/2 p-2" type="text" placeholder="Search" />
                        <div>
                            {isAdmin && (
                                <>
                                    <button className="bg-blue-800 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded mr-1" onClick={() => {
                                        toggleModal();
                                    }}>
                                        <FontAwesomeIcon icon={faGear} />
                                    </button>
                                    <select 
                                        value={filterTypeDataSelector}
                                        onChange={e => {
                                            const newFilterValue = e.target.value;
                                            
                                            // Save current page for current filter before switching
                                            setLastPages(prev => ({
                                                ...prev,
                                                [filterTypeDataSelector]: currentPage
                                            }));
                                            
                                            // Get the saved page for the new filter
                                            const savedPage = lastPages[newFilterValue] || 1;
                                            
                                            dispath(setFilterAction(newFilterValue));
                                            setCurrentPage(savedPage);
                                            
                                            // Update URL with new filter
                                            const params = { page: savedPage };
                                            // Only add filterType if it's not 'all' (default)
                                            if (newFilterValue !== 'all') {
                                                params.filterType = newFilterValue;
                                            }
                                            
                                            router.get('/validators', params, {
                                                preserveState: true,
                                                preserveScroll: true,
                                                replace: true, // Use replace to ensure URL updates
                                                only: ['validatorsData', 'totalCount'],
                                                onSuccess: (page) => {
                                                    setData(page.props.validatorsData);
                                                    setTotalRecords(page.props.totalCount);
                                                }
                                            });
                                        }}>
                                        <option value="all">{msg.get('validators.all')}</option>
                                        <option value="top">{msg.get('validators.top')}</option>
                                        <option value="highlight">{msg.get('validators.highlight')}</option>
                                    </select>
                                </>
                            )}
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
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                                                            className="px-2 py-1 text-xs"
                                                        >
                                                            <FontAwesomeIcon icon={faChevronDown} />
                                                        </button>
                                                        {showAdminDropdown && (
                                                            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                                                <div className="py-1">
                                                                    <button
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                        onClick={() => {
                                                                            addMarkToValidators('top');
                                                                            setShowAdminDropdown(false);
                                                                        }}
                                                                    >
                                                                        Set Top
                                                                    </button>
                                                                    <button
                                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                        onClick={() => {
                                                                            addMarkToValidators('highlight');
                                                                            setShowAdminDropdown(false);
                                                                        }}
                                                                    >
                                                                        Highlight
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </th>
                                        <th>Actions</th>
                                        {getOrderedVisibleColumns().map(column => renderColumnHeader(column.name))}
                                    </tr>
                                </thead>
                                <tbody>
                                {data.map((validator, index) => (
                                    <tr>
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
                        {(showModal && isAdmin) && (
                            <Modal 
                                onClose={closeModal} 
                                onSave={handleColumnSettingsSave}
                                onColumnChange={(columnName, isVisible, index, updatedList) => {
                                    console.log(`Column "${columnName}" at index ${index} changed to: ${isVisible ? 'visible' : 'hidden'}`);
                                    
                                    // Update the columns configuration
                                    setColumnsConfig(updatedList);
                                    
                                    // Output updated array with current positions and visibility
                                    const columnObjects = updatedList.map((item, idx) => ({
                                        name: item.name,
                                        position: idx + 1,
                                        visible: item.show
                                    }));
                                    console.log('Updated columns array:', columnObjects);
                                }}
                                onSort={(newList) => {
                                    // Update the columns configuration
                                    setColumnsConfig(newList);
                                    
                                    const columnObjects = newList.map((item, index) => ({
                                        name: item.name,
                                        position: index + 1,
                                        visible: item.show
                                    }));
                                    console.log('Columns reordered:', columnObjects);
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
