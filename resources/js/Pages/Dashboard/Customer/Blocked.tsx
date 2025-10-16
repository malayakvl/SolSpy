import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import Lang from 'lang.js';
// import lngVaidators from '../../../Lang/Validators/translation';
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
import { perPageSelector, filterTypeSelector } from '../../../Redux/Validators/selectors';
import { Link } from "@inertiajs/react";
import { userSelector } from '../../../Redux/Users/selectors';
import Modal from './Partials/ColumnsModal';
import { CarouselProvider, Slider, Slide, ButtonBack, ButtonNext, DotGroup } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import ValidatorPagination from './Pagination';
import { renderColumnHeader, renderColumnCell, initializeColumnsConfig } from '../../../Components/Validators/ValidatorTableComponents';
import ValidatorFilters from './Partials/ValidatorFilters';
import ValidatorTable from '../../../Components/Validators/ValidatorTable';

export default function Blocked({validatorsData}) {
    const dispatch = useDispatch();
    const [data, setData] = useState<any>(validatorsData.blockedValidators);
    const [bannedValidators, setBannedValidators] = useState<number[]>([]);
    const perPage = useSelector(perPageSelector);
    const appLang = useSelector(appLangSelector);
    const filterTypeDataSelector = validatorsData.filterType || useSelector(filterTypeSelector); // Filter type from props or Redux state
    const [slideCount, setSlideCount] = useState(2);
    const [currentSlide, setCurrentSlide] = useState(0);
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
        return initializeColumnsConfig(validatorsData.settingsData);
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
        // Set up interval for periodic data fetching
        const intervalId = setInterval(() => {
            fetchData();
        }, parseInt(validatorsData.settingsData.update_interval) * 1000);
        
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
    
    // Fetch data when currentPage changes
    useEffect(() => {
        fetchData();
    }, [currentPage]);
    
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
        };
        
        // Listen for popstate events (back/forward navigation)
        window.addEventListener('popstate', handleUrlChange);
        
        // Check if URL has changed on component mount
        handleUrlChange();
        
        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, [currentPage, filterTypeDataSelector]);


    // Helper function to get ordered visible columns
    const getOrderedVisibleColumns = () => {
        const filtered = columnsConfig.filter(col => col.show);
        // console.log('Filtering columns:', columnsConfig);
        // console.log('Filtered columns:', filtered);
        return filtered;
    };

    // Helper function to render column header by name
    const renderColumnHeaderLocal = (columnName) => {
        return renderColumnHeader(columnName, sortClickState, setSortClickState, setCurrentPage, isLoading, setIsPaginationOrSorting);
    };

    // Helper function to render column cell by name
    const renderColumnCellLocal = (columnName, validator, index) => {
        return renderColumnCell(columnName, validator, epoch, validatorsData.settingsData, validatorsData.totalStakeData, data);
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
            // Use authenticated endpoint if user is logged in, otherwise use public endpoint
            let url = user ? 
                `/api/fetch-blocked-validators?page=${currentPageFromUrl}&filterType=${currentFilterType}&sortColumn=${sortColumn}&sortDirection=${sortDirection}` :
                `/api/fetch-blocked-validators?page=${currentPageFromUrl}&filterType=${currentFilterType}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
                
            if (searchParam) {
                url += `&search=${encodeURIComponent(searchParam)}`;
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
            // Hide loading indicator after pagination and sorting operations
            if (isPaginationOrSorting) {
                setIsLoading(false);
                // Reset the flag
                setIsPaginationOrSorting(false);
            }
        }
    };
    return (
        <div className="mt-6">
            <ValidatorTable
                data={data}
                columnsConfig={columnsConfig}
                selectAll={selectAll}
                checkedIds={checkedIds}
                handleSelectAllChange={handleSelectAllChange}
                handleCheckboxChange={handleCheckboxChange}
                handleBanToggle={handleBanToggle}
                sortClickState={sortClickState}
                setSortClickState={setSortClickState}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading}
                setIsPaginationOrSorting={setIsPaginationOrSorting}
                epoch={epoch}
                settingsData={validatorsData.settingsData}
                totalStakeData={validatorsData.totalStakeData}
                getOrderedVisibleColumns={getOrderedVisibleColumns}
            /> 
                        
            {/* <ValidatorPagination 
                currentPage={currentPage}
                totalPages={totalPages}
                filterType={filterTypeDataSelector}
                onPageChange={handlePageChange}
            /> */}
        </div>
    );
}