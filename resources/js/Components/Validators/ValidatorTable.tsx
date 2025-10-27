import React from 'react';
import { renderColumnHeader, renderColumnCell } from './ValidatorTableComponents';
import ValidatorActions from '../../Pages/Validators/Partials/ValidatorActions';

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
        return renderColumnCell(
            columnName, 
            validator, 
            epoch, 
            settingsData, 
            totalStakeData, 
            data
        );
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
                        <tr key={validator.id} className={validator.is_highlighted ? 'bg-pink-100' : ''}>
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
    );
};

export default ValidatorTable;