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
import { renderColumnHeader, renderColumnCell } from '../../../Components/Validators/ValidatorTableComponents';

export default function AdminIndex(validatorsData) {
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
            // Set flag to indicate this is a pagination operation
            setIsPaginationOrSorting(true);
            
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
        // console.log('Filtering columns:', columnsConfig);
        // console.log('Filtered columns:', filtered);
        return filtered;
    };

    // Helper function to render column cell by name
    const renderColumnCellLocal = (columnName, validator, index) => {
        return renderColumnCell(columnName, validator, epoch, validatorsData.settingsData, validatorsData.totalStakeData, data);
    };

    // Helper function to render column header by name
    const renderColumnHeaderLocal = (columnName) => {
        return renderColumnHeader(columnName, sortClickState, setSortClickState, setCurrentPage, isLoading, setIsPaginationOrSorting);
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
        // Show loading indicator only for pagination and sorting operations
        if (isPaginationOrSorting) {
            setIsLoading(true);
        }
        
        // Get filter value and other parameters from current URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentFilterType = urlParams.get('filterType') || 'all';
        const searchParam = urlParams.get('search') || '';
        const sortColumn = urlParams.get('sortColumn') || 'id';
        const sortDirection = urlParams.get('sortDirection') || 'ASC';
        const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
        
        try {
            // Build URL with all parameters
            let url = `/api/fetch-validators-auth?page=${currentPageFromUrl}&filterType=${currentFilterType}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
            if (searchParam) {
                url += `&search=${encodeURIComponent(searchParam)}`;
            }
            
            const response = await axios.get(url);
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
                                        {getOrderedVisibleColumns().map(column => renderColumnHeaderLocal(column.name))}
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
                                        {getOrderedVisibleColumns().map(column => renderColumnCellLocal(column.name, validator, index))}
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