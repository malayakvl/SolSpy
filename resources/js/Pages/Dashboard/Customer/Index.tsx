import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngDashboard from '../../../Lang/Dashboard/translation';
import { appLangSelector, appEpochSelector } from '../../../Redux/Layout/selectors';
import React, { useState } from 'react';
import { renderColumnHeader, renderColumnCell, initializeColumnsConfig } from '../../../Components/Validators/ValidatorTableComponents';
import { useSelector, useDispatch } from 'react-redux';
import ValidatorActions from '../../../Pages/Validators/Partials/ValidatorActions';
// import ValidatorTable from '../../../Components/Validators/ValidatorTable';
import Favorites from '../../../Pages/Dashboard/Customer/Favorites';
import Blocked from '../../../Pages/Dashboard/Customer/Blocked';
import Compare from '../../../Pages/Dashboard/Customer/Compare';


export default function Dashboard(validatorsData) {
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngDashboard,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);
    const user = usePage().props.auth.user;
    const [sortClickState, setSortClickState] = useState<{column: string, direction: string} | null>(null); // Track sort click state
    const [currentPage, setCurrentPage] = useState(validatorsData.currentPage);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [isPaginationOrSorting, setIsPaginationOrSorting] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [data, setData] = useState<any>(validatorsData.favoriteValidators);
    const [selectAll, setSelectAll] = useState(false);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [bannedValidators, setBannedValidators] = useState<number[]>([]);
    const [columnsConfig, setColumnsConfig] = useState(() => {
        return initializeColumnsConfig(validatorsData.settingsData);
    });
console.log(validatorsData)
    const handleCheckboxChange = (id) => {
        if (checkedIds.includes(id)) {
            // Remove from checkedIds
            setCheckedIds(prev => prev.filter(checkedId => checkedId !== id));
        } else {
            // Add to checkedIds
            setCheckedIds(prev => [...prev, id]);
        }
        
        // Update selectAll state based on whether all visible (non-banned) rows are checked
        const visibleValidatorIds = validatorsData.favoriteValidators
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
        const visibleValidatorIds = validatorsData.favoriteValidators
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


  
    // State for managing active tab
    const [activeTab, setActiveTab] = useState('favorites');

    // Extract role name from user roles array
    const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;

    const getOrderedVisibleColumns = () => {
        const filtered = columnsConfig.filter(col => col.show);
        // console.log('Filtering columns:', columnsConfig);
        // console.log('Filtered columns:', filtered);
        return filtered;
    };

    // Show tabs interface only for users without roles (guests) or with specific role handling
    return (
            <AuthenticatedLayout header={<Head />}>
                <Head title={msg.get('dashboard.title')} />
                
            </AuthenticatedLayout>
        )
}