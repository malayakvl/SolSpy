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
                <div className="py-0">
                    <div className="p-4 sm:p-8 mb-8 content-data bg-content">
                        <h2>{msg.get('dashboard.title')}&nbsp;Customer</h2>
                        <div className="mt-6">
                            {/* Tabs navigation */}
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('favorites')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'favorites'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {msg.get('dashboard.favorites')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('comparisons')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'comparisons'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {msg.get('dashboard.comparisons')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('blocked')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'blocked'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {msg.get('dashboard.blocked')}
                                    </button>
                                </nav>
                            </div>
                            
                            {/* Tab content */}
                            <div className="mt-4">
                                {activeTab === 'favorites' && (
                                    <div id="favorites">
                                        {/* <Favorites validatorsData={validatorsData}/> */}
                                    </div>
                                )}
                                {activeTab === 'comparisons' && (
                                    <div id="comparisons">
                                        {/* <Compare validatorsData={validatorsData}/> */}
                                    </div>
                                )}
                                {activeTab === 'blocked' && (
                                    <div id="blocked">
                                        <Blocked validatorsData={validatorsData}/>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        )
}