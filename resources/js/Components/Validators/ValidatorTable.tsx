import React from 'react';
import { renderColumnHeader } from './ValidatorTableComponents';
import ValidatorActions from '../../Pages/Validators/Partials/ValidatorActions';
// Import the validator partial components
import ValidatorActivatedStake from '../../Pages/Validators/Partials/ValidatorActivatedStake';
import ValidatorCredits from '../../Pages/Validators/Partials/ValidatorCredits';
import ValidatorRate from '../../Pages/Validators/Partials/ValidatorRate';
import ValidatorSpyRank from '../../Pages/Validators/Partials/ValidatorSpyRank';
import ValidatorUptime from '../../Pages/Validators/Partials/ValidatorUptime';
import ValidatorName from '../../Pages/Validators/Partials/ValidatorName';
import ValidatorScore from '../../Pages/Validators/Partials/ValidatorScore';
import ValidatorSFDP from '../../Pages/Validators/Partials/ValidatorSFDP';
import ValidatorStatus from '../../Pages/Validators/Partials/ValidatorStatus';
import ValidatorJiitoScore from '../../Pages/Validators/Partials/ValidatorJiitoScore';
import ValidatorTVCScore from '../../Pages/Validators/Partials/ValidatorTVCScore';

interface ValidatorTableProps {
    data: any[];
    columnsConfig: { name: string; show: boolean }[];
    selectAll: boolean;
    checkedIds: string[];
    handleSelectAllChange: () => void;
    handleCheckboxChange: (id: string) => void;
    handleBanToggle: (validatorId: number, isBanned: boolean) => void;
    sortClickState: { column: string; direction: string } | null;
    setSortClickState: React.Dispatch<React.SetStateAction<{ column: string; direction: string } | null>>;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    isLoading: boolean;
    setIsPaginationOrSorting: React.Dispatch<React.SetStateAction<boolean>> | null;
    epoch: any;
    settingsData: any;
    totalStakeData: any;
    getOrderedVisibleColumns: () => { name: string; show: boolean }[];
}

const ValidatorTable: React.FC<ValidatorTableProps> = ({
    data,
    columnsConfig,
    selectAll,
    checkedIds,
    handleSelectAllChange,
    handleCheckboxChange,
    handleBanToggle,
    sortClickState,
    setSortClickState,
    setCurrentPage,
    isLoading,
    setIsPaginationOrSorting,
    epoch,
    settingsData,
    totalStakeData,
    getOrderedVisibleColumns
}) => {
    // Helper function to render column header by name
    const renderColumnHeaderLocal = (columnName: string) => {
        return renderColumnHeader(
            columnName, 
            sortClickState, 
            setSortClickState, 
            setCurrentPage, 
            isLoading, 
            setIsPaginationOrSorting
        );
    };

    // Helper function to render column cell by name
    const renderColumnCellLocal = (columnName: string, validator: any, index: number) => {
        // Render cell content without wrapping in <td>
        switch(columnName) {
            case "Spy Rank": 
                return <ValidatorSpyRank validator={validator} />;
            case "Avatar": 
                return validator.avatar_url || validator.avatar_file_url ? (
                    <img 
                        src={validator.avatar_url || validator.avatar_file_url} 
                        alt={`${validator.name} avatar`} 
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            // Create a fallback element
                            const fallback = document.createElement('div');
                            fallback.className = 'w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500';
                            fallback.textContent = 'SP';
                            e.currentTarget.parentNode.appendChild(fallback);
                        }}
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500 font-medium">SP</span>
                    </div>
                );
            case "Name": 
                return <ValidatorName validator={validator} />;
            case "Status": 
                return <ValidatorStatus validator={validator} />;
            case "TVC Score": 
                return <ValidatorTVCScore validator={validator} />;
            case "TVC Rank": 
                return validator.tvcRank || 'N/A';
            case "Vote Credits": 
                return <ValidatorCredits validator={validator} epoch={epoch} />;
            case "Active Stake": 
                return <ValidatorActivatedStake validator={validator} epoch={epoch} />;
            case "Vote Rate": 
                return <ValidatorRate validator={validator} epoch={epoch} settingsData={settingsData} totalStakeData={totalStakeData} />;
            case "Jiito Score": 
                return <ValidatorJiitoScore validator={validator} epoch={epoch} />;
            case "Active": 
                return !validator.delinquent ? 'Active' : 'Offline';
            case "Inflation Commission": 
                return validator.jito_commission !== undefined ? `${(parseFloat(validator.jito_commission) / 100).toFixed(2)}%` : 'N/A';
            case "MEV Commission": 
                return validator.commission !== undefined ? `${parseFloat(validator.commission).toFixed(2)}%` : 'N/A';
            case "Jito Score": 
                return validator.jito_commission !== undefined ? parseFloat(validator.jito_commission).toFixed(4) : 'N/A';
            case "Uptime": 
                return validator.uptime;
            case "Client/Version": 
                // Use the latest version from validator scores if available, fallback to existing fields
                const version = validator.latestVersion || validator.version || validator.software_version || 'N/A';
                return version;
            case "Status SFDP": 
                return <ValidatorSFDP validator={validator} epoch={epoch} />;
            case "Location": 
                return validator.country || validator.ip_country || 'N/A';
            case "Awards": 
                return validator.awards || 'N/A';
            case "Website": 
                return validator.url || validator.www_url || 'N/A';
            case "City": 
                return validator.city || validator.ip_city || 'N/A';
            case "ASN": 
                return validator.autonomous_system_number || validator.ip_asn || 'N/A';
            case "IP": 
                return validator.ip || 'N/A';
            default: 
                return null;
        }
    };

    return (
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
                    {data.map((validator, index) => (
                        <tr key={validator.id} className={validator.is_highlighted ? 'bg-selected' : ''}>
                            <td className="text-left text-white">
                                <div className="pl-[10px]">
                                    <input 
                                        key={`checkbox-${validator.id}`}
                                        type="checkbox" 
                                        id={validator.id} 
                                        checked={checkedIds.includes(validator.id)}
                                        onChange={() => handleCheckboxChange(validator.id)} 
                                    />
                                </div>
                            </td>
                            <td className="text-center text-white">
                                <ValidatorActions key={`actions-${validator.id}`} validator={validator} onBanToggle={handleBanToggle} />
                            </td>
                            {getOrderedVisibleColumns().map((column, colIndex) => (
                                <td key={`${validator.id}-${colIndex}`} className="text-white">
                                    {renderColumnCellLocal(column.name, validator, index)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ValidatorTable;