import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../../Lang/Validators/translation';
import { useSelector, useDispatch } from 'react-redux';
import { appLangSelector } from '../../../Redux/Layout/selectors';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import{ showOverlayAction } from '../../../Redux/Layout/index';

interface FiltersProps {
    filterType: string;
    onFilterChange: (newFilter: string) => void;
    isAdmin: boolean;
    onGearClick: () => void;
    searchTerm: string;
    onSearchChange: (searchTerm: string) => void;
}

export default function ValidatorFilters({ filterType, onFilterChange, isAdmin, onGearClick, searchTerm, onSearchChange }: FiltersProps) {
    const appLang = useSelector(appLangSelector);
    const [currentFilter, setCurrentFilter] = useState(filterType || 'all');
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
    const dispatch = useDispatch();

    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });

    // Update local state when filterType prop changes
    useEffect(() => {
        setCurrentFilter(filterType || 'all');
    }, [filterType]);
    
    // Update local search term when prop changes
    useEffect(() => {
        setLocalSearchTerm(searchTerm || '');
    }, [searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Apply search and filter
        const params: any = {};
        
        // Add search term if it exists
        if (localSearchTerm) {
            params.search = localSearchTerm;
        }
        
        // Add filterType if it's not 'all' (default)
        if (currentFilter !== 'all') {
            params.filterType = currentFilter;
        }
        
        // Update the browser URL
        const urlParams = new URLSearchParams(window.location.search);
        if (localSearchTerm) {
            urlParams.set('search', localSearchTerm);
        } else {
            urlParams.delete('search');
        }
        
        if (currentFilter !== 'all') {
            urlParams.set('filterType', currentFilter);
        } else {
            urlParams.delete('filterType');
        }
        
        // Get current page from URL or default to 1
        const currentPage = parseInt(urlParams.get('page')) || 1;
        urlParams.set('page', currentPage.toString());
        
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
        
        router.get('/validators', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                // Refresh data after search
                const event = new CustomEvent('filterChanged', { detail: params });
                window.dispatchEvent(event);
            }
        });
    };

    const handleFilterChange = (newFilterValue: string) => {
        setCurrentFilter(newFilterValue);
        onFilterChange(newFilterValue);
        dispatch(showOverlayAction(true));
        // Apply filter with current search term
        const params: any = {};
        
        // Add search term if it exists
        if (localSearchTerm) {
            params.search = localSearchTerm;
        }
        
        // Only add filterType if it's not 'all' (default)
        if (newFilterValue !== 'all') {
            params.filterType = newFilterValue;
        }
        
        // Update the browser URL
        const urlParams = new URLSearchParams(window.location.search);
        if (localSearchTerm) {
            urlParams.set('search', localSearchTerm);
        }
        
        if (newFilterValue !== 'all') {
            urlParams.set('filterType', newFilterValue);
        } else {
            urlParams.delete('filterType');
        }
        
        // Get current page from URL or default to 1
        const currentPage = parseInt(urlParams.get('page')) || 1;
        urlParams.set('page', currentPage.toString());
        
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
        
        router.get('/admin/validators', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                // Refresh data after filter change
                const event = new CustomEvent('filterChanged', { detail: params });
                window.dispatchEvent(event);
                dispatch(showOverlayAction(false));
            },
            onError: () => {
                dispatch(showOverlayAction(false));
            }
        });
    };

    const handleClearFilters = () => {
        // Reset local state
        setLocalSearchTerm('');
        setCurrentFilter('all');
        onFilterChange('all');
        onSearchChange('');
        
        // Clear URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.delete('search');
        urlParams.delete('filterType');
        
        // Get current page from URL or default to 1
        const currentPage = parseInt(urlParams.get('page')) || 1;
        urlParams.set('page', currentPage.toString());
        
        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
        
        router.get('/admin/validators', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                // Refresh data after clearing filters
                const event = new CustomEvent('filterChanged', { detail: {} });
                window.dispatchEvent(event);
            }
        });
    };

    return (
        <form onSubmit={handleSearch} className="flex items-start gap-4">
            <input 
                className="flex-1 p-2 border border-gray-300 rounded text-sm"
                type="text" 
                placeholder="Search by name..." 
                value={localSearchTerm}
                onChange={(e) => {
                    const newValue = e.target.value;
                    setLocalSearchTerm(newValue);
                    onSearchChange(newValue);
                    
                    // Update URL in real-time as user types
                    const urlParams = new URLSearchParams(window.location.search);
                    if (newValue) {
                        urlParams.set('search', newValue);
                    } else {
                        urlParams.delete('search');
                    }
                    
                    // Keep current page and filter
                    const currentPage = parseInt(urlParams.get('page')) || 1;
                    urlParams.set('page', currentPage.toString());
                    
                    if (currentFilter !== 'all') {
                        urlParams.set('filterType', currentFilter);
                    }
                    
                    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                    window.history.replaceState({}, '', newUrl);
                }}
            />
            <button 
                type="submit"
                className="px-4 py-2 bg-[#703ea2] text-white rounded hover:bg-[#78549c] text-[13px]  text-sm"
            >
                Search
            </button>
            {isAdmin && (
                <>
                    <button 
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-[#78549c] text-sm"
                    >
                        Clear
                    </button>
                    <select 
                        value={currentFilter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="p-2 border border-gray-300 rounded text-sm"
                    >
                        <option value="all">{msg.get('validators.all')}</option>
                        <option value="top">{msg.get('validators.top')}</option>
                        <option value="highlight">{msg.get('validators.highlight')}</option>
                    </select>
                    <button 
                        type="button"
                        onClick={onGearClick}
                        className="p-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                        title="Configure Columns"
                    >
                        <FontAwesomeIcon icon={faGear} />
                    </button>
                </>
            )}
        </form>
    );
}