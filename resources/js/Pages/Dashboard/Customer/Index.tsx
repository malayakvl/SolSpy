import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngDashboard from '../../../Lang/Dashboard/translation';
import { appLangSelector, appEpochSelector } from '../../../Redux/Layout/selectors';
import React, { useState } from 'react';
import { renderColumnHeader, renderColumnCell } from '../../../Components/Validators/ValidatorTableComponents';
import { useSelector, useDispatch } from 'react-redux';
import ValidatorActions from '../../../Pages/Validators/Partials/ValidatorActions';


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

    const renderColumnHeaderLocal = (columnName) => {
        return renderColumnHeader(columnName, sortClickState, setSortClickState, setCurrentPage, isLoading, setIsPaginationOrSorting);
    };

    const renderColumnCellLocal = (columnName, validator, index) => {
        return renderColumnCell(columnName, validator, epoch, validatorsData.settingsData, validatorsData.totalStakeData, data);
    };

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
                                                            </div>
                                                        </th>
                                                        <th>Actions</th>
                                                        {getOrderedVisibleColumns().map(column => renderColumnHeaderLocal(column.name))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {validatorsData.favoriteValidators.map((validator, index) => (
                                                    <tr key={validator.id} className={validator.is_highlighted ? 'bg-blue-100' : ''}>
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
                                        {/* Favorites content will go here */}
                                    </div>
                                )}
                                {activeTab === 'comparisons' && (
                                    <div id="comparisons">
                                        Comparisons
                                        {/* Comparisons content will go here */}
                                    </div>
                                )}
                                {activeTab === 'blocked' && (
                                    <div id="blocked">
                                        Blocked
                                        {/* Blocked content will go here */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        )
}