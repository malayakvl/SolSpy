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
}

export default function ValidatorFilters({ filterType, onFilterChange, isAdmin, onGearClick }: FiltersProps) {
    const appLang = useSelector(appLangSelector);
    const [currentFilter, setCurrentFilter] = useState(filterType || 'all');
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });

    // Update local state when filterType prop changes
    useEffect(() => {
        setCurrentFilter(filterType || 'all');
    }, [filterType]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Apply search and filter
        const params: any = {};
        
        // Add search term if it exists
        if (searchTerm) {
            params.search = searchTerm;
        }
        
        // Add filterType if it's not 'all' (default)
        if (currentFilter !== 'all') {
            params.filterType = currentFilter;
        }
        
        router.get('/admin/validators', params, {
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
        if (searchTerm) {
            params.search = searchTerm;
        }
        
        // Only add filterType if it's not 'all' (default)
        if (newFilterValue !== 'all') {
            params.filterType = newFilterValue;
        }
        
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
        setSearchTerm('');
        setCurrentFilter('all');
        onFilterChange('all');
        
        // Clear URL parameters
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600  text-sm"
            >
                Search
            </button>
            {isAdmin && (
                <>
                    <button 
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
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