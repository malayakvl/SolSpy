import React from 'react';
import { renderColumnHeader } from './ValidatorTableComponents';
import ValidatorActions from '../../Pages/Validators/Partials/ValidatorActions';
// Import the validator partial components
import ValidatorActivatedStake from '../../Pages/ValidatorDatas/Partials/ValidatorActivatedStake';
import ValidatorCredits from '../../Pages/ValidatorDatas/Partials/ValidatorCredits';
import ValidatorRate from '../../Pages/ValidatorDatas/Partials/ValidatorRate';
import ValidatorSpyRank from '../../Pages/ValidatorDatas/Partials/ValidatorSpyRank';
import ValidatorName from '../../Pages/ValidatorDatas/Partials/ValidatorName';
import ValidatorSFDP from '../../Pages/ValidatorDatas/Partials/ValidatorSFDP';
import ValidatorStatus from '../../Pages/ValidatorDatas/Partials/ValidatorStatus';
import ValidatorJiitoScore from '../../Pages/ValidatorDatas/Partials/ValidatorJiitoScore';
import TVCScore from '../../Pages/ValidatorDatas/Partials/TVCScore';
import ValidatorVoteRate from '../../Pages/ValidatorDatas/Partials/ValidatorVoteRate';

interface ValidatorTableProps {
  data: any[];
  columnsConfig: { name: string; show: boolean }[];
  selectAll: boolean;
  checkedIds: string[];
  handleSelectAllChange: () => void;
  handleCheckboxChange: (id: string) => void;
  handleBanToggle: (validatorId: number, isBanned: boolean) => void;
  sortClickState: { column: string; direction: string } | null;
  setSortClickState: React.Dispatch<
    React.SetStateAction<{ column: string; direction: string } | null>
  >;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  isLoading: boolean;
  setIsPaginationOrSorting: React.Dispatch<
    React.SetStateAction<boolean>
  > | null;
  epoch: any;
  settingsData: any;
  totalStakeData: any;
  getOrderedVisibleColumns: () => { name: string; show: boolean }[];
}

// Маппер имён колонок интерфейса к ключам сортировки в базе/API
const getSortKeyByColumnName = (columnName: string): string => {
  switch (columnName.trim()) {
    case 'Spy Rank':
      return 'spy_rank';
    case 'Name':
      return 'name';
    case 'TVC Score':
      return 'tvc_score';
    case 'TVC Rank':
      return 'tvc_rank';
    case 'Vote Credits':
      return 'vote_credits';
    case 'Active Stake':
      return 'activated_stake';
    case 'Vote Rate':
      return 'vote_rate';
    case 'Jiito Score':
    case 'Jito Score':
      return 'jiito_score';
    case 'Inflation Commission':
    case 'MEV Commission':
      return 'commission';
    case 'Uptime':
      return 'avg_uptime';
    case 'Client/Version':
      return 'version';
    default:
      return '';
  }
};

const ValidatorDataTable: React.FC<ValidatorTableProps> = ({
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
  getOrderedVisibleColumns,
}) => {
  // 1. Достаем параметры из URL (пример для React Router / Next.js / URLSearchParams)
  const searchParams = new URLSearchParams(window.location.search);
  const urlSortColumn = searchParams.get('sortColumn');
  const urlSortDirection = searchParams.get('sortDirection');

  // 2. Приоритет: Клик пользователя > Параметр из URL > Дефолтное значение
  const activeSortColumn = (
    sortClickState?.column ||
    urlSortColumn ||
    'tvc_score'
  )
    .trim()
    .toLowerCase();

  const activeSortDirection =
    sortClickState?.direction || urlSortDirection || 'DESC';

  const isAsc = activeSortDirection === 'ASC';
  const highlightClasses = {
    headerAsc:
      'bg-emerald-600/40 text-emerald-100 border-x border-t border-emerald-500/40 font-bold transition-colors',
    cellAsc: 'bg-emerald-500/20 border-x border-emerald-500/20 font-semibold',
    headerDesc:
      'bg-indigo-600/40 text-indigo-100 border-x border-t border-indigo-500/40 font-bold transition-colors',
    cellDesc: 'bg-indigo-500/20 border-x border-indigo-500/20 font-semibold',
  };

  const headerClass = isAsc
    ? highlightClasses.headerAsc
    : highlightClasses.headerDesc;
  const cellClass = isAsc
    ? highlightClasses.cellAsc
    : highlightClasses.cellDesc;

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

  const renderColumnCellLocal = (
    columnName: string,
    validator: any,
    index: number
  ) => {
    switch (columnName) {
      case 'Spy Rank':
        return <ValidatorSpyRank validator={validator} />;
      case 'Avatar':
        return validator.avatar_url || validator.avatar_file_url ? (
          <img
            src={validator.avatar_url || validator.avatar_file_url}
            alt={`${validator.name} avatar`}
            className="w-8 h-8 rounded-full"
            onError={e => {
              e.currentTarget.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className =
                'w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500';
              fallback.textContent = 'SP';
              e.currentTarget.parentNode?.appendChild(fallback);
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500 font-medium">SP</span>
          </div>
        );
      case 'Name':
        return <ValidatorName validator={validator} />;
      case 'Status':
        return <ValidatorStatus validator={validator} />;
      case 'TVC Score':
        return <TVCScore validator={validator} />;
      case 'TVC Rank':
        return validator.tvcRank || 'N/A';
      case 'Vote Credits':
        return <ValidatorCredits validator={validator} epoch={epoch} />;
      case 'Active Stake':
        return <ValidatorActivatedStake validator={validator} epoch={epoch} />;
      case 'Vote Rate':
        return (
          <ValidatorVoteRate
            validator={validator}
            epoch={epoch}
            settingsData={settingsData}
            totalStakeData={totalStakeData}
          />
        );
      case 'Jiito Score':
        return <ValidatorJiitoScore validator={validator} />;
      case 'Active':
        return !validator.delinquent ? 'Active' : 'Offline';
      case 'Inflation Commission':
        return validator.jito_commission !== undefined
          ? `${(parseFloat(validator.jito_commission) / 100).toFixed(2)}%`
          : 'N/A';
      case 'MEV Commission':
        return validator.commission !== undefined
          ? `${parseFloat(validator.commission).toFixed(2)}%`
          : 'N/A';
      case 'Jito Score':
        return validator.jito_commission !== undefined
          ? parseFloat(validator.jito_commission).toFixed(4)
          : 'N/A';
      case 'Uptime':
        return validator.uptime;
      case 'Client/Version':
        return (
          validator.latestVersion ||
          validator.version ||
          validator.software_version ||
          'N/A'
        );
      case 'Status SFDP':
        return <ValidatorSFDP validator={validator} epoch={epoch} />;
      case 'Location':
        return validator.country || validator.ip_country || 'N/A';
      case 'Awards':
        return validator.awards || 'N/A';
      case 'Website':
        return validator.url || validator.www_url || 'N/A';
      case 'City':
        return validator.city || validator.ip_city || 'N/A';
      case 'ASN':
        return validator.autonomous_system_number || validator.ip_asn || 'N/A';
      case 'IP':
        return validator.ip || 'N/A';
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto relative min-h-[200px]">
      {/* 🚀 Оверлей Лоадера при загрузке/сортировке */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center transition-all duration-200">
          <div className="flex flex-col items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-2xl">
            <svg
              className="animate-spin h-7 w-7 text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-xs font-medium text-slate-200 tracking-wide">
              Updating data...
            </span>
          </div>
        </div>
      )}

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
            {getOrderedVisibleColumns().map(column => {
              const sortKey = getSortKeyByColumnName(column.name).toLowerCase();
              const isSorted = !!sortKey && activeSortColumn === sortKey;

              return (
                <th key={column.name} className={isSorted ? headerClass : ''}>
                  {renderColumnHeaderLocal(column.name)}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody
          className={
            isLoading
              ? 'opacity-40 transition-opacity duration-200 pointer-events-none'
              : 'transition-opacity duration-200'
          }
        >
          {data.map((validator, index) => (
            <tr
              key={validator.id}
              className={validator.is_highlighted ? 'bg-selected' : ''}
            >
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
                <ValidatorActions
                  key={`actions-${validator.id}`}
                  validator={validator}
                  onBanToggle={handleBanToggle}
                />
              </td>
              {getOrderedVisibleColumns().map((column, colIndex) => {
                const sortKey = getSortKeyByColumnName(
                  column.name
                ).toLowerCase();
                const isSorted = !!sortKey && activeSortColumn === sortKey;

                return (
                  <td
                    key={`${validator.id}-${colIndex}`}
                    className={`text-white ${isSorted ? cellClass : ''}`}
                  >
                    {renderColumnCellLocal(column.name, validator, index)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ValidatorDataTable;
