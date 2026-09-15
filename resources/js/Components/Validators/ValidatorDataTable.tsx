import React, { useEffect, useState } from 'react';
import ValidatorActions from '../../Pages/Validators/Partials/ValidatorActions';
import { TableHeaderCell } from './TableHeaderCell';
import { Head, usePage, router } from '@inertiajs/react';

// Импорты партиалов для ячеек
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

// Маппинг заголовков к ключам API
const SORT_KEY_MAP: Record<string, string> = {
  'Spy Rank': 'spy_rank',
  Name: 'name',
  Status: 'status',
  'TVC Score': 'tvc_score',
  'TVC Rank': 'tvc_rank',
  'Vote Credits': 'vote_credits',
  'Active Stake': 'activated_stake',
  'Vote Rate': 'vote_rate',
  'Jiito Score': 'jiito_score',
  'Jito Score': 'jiito_score',
  'Inflation Commission': 'inflation_commission',
  'MEV Commission': 'mev_commission',
  Uptime: 'uptime',
  'Client/Version': 'client_version',
  'Status SFDP': 'status_sfdp',
  Location: 'location',
  Awards: 'awards',
  Website: 'website',
  City: 'city',
  ASN: 'asn',
  IP: 'ip',
};

interface ValidatorTableProps {
  validatorData: any[];
  columnsConfig: { name: string; show: boolean }[];
  selectAll: boolean;
  checkedIds: string[];
  handleSelectAllChange: () => void;
  handleCheckboxChange: (id: string) => void;
  handleBanToggle: (validatorId: number, isBanned: boolean) => void;
  sortClickState: { column: string; direction: string } | null;
  isLoading: boolean;
  epoch: any;
  settingsData: any;
  totalStakeData: any;
  getOrderedVisibleColumns: () => { name: string; show: boolean }[];
  onSortChange: (sortKey: string, direction: string) => void;
}

const ValidatorDataTable: React.FC<ValidatorTableProps> = ({
  validatorData,
  totalDataRecords,
  selectAll,
  checkedIds,
  handleSelectAllChange,
  handleCheckboxChange,
  handleBanToggle,
  sortClickStateOld,
  isLoadingData,
  epoch,
  settingsData,
  totalStakeData,
  getOrderedVisibleColumns,
}) => {
  // Достаем активную сортировку из URL или стейта
  const searchParams = new URLSearchParams(window.location.search);
  const [dataFetched, setDataFetched] = useState(false);
  const [totalRecords, setTotalRecords] = useState<number>(totalDataRecords);
  const [isPaginationOrSorting, setIsPaginationOrSorting] = useState(false);
  const [sortClickState, setSortClickState] = useState<{
    column: string;
    direction: string;
  } | null>(null); // Track sort click state
  const { auth } = usePage().props as unknown as { auth: any };
  const user = auth?.user;
  const [data, setData] = useState<any>(validatorData);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeSortColumn = (
    sortClickState?.column ||
    searchParams.get('sortColumn') ||
    'tvc_score'
  )
    .trim()
    .toLowerCase();
  const activeSortDirection =
    sortClickState?.direction || searchParams.get('sortDirection') || 'DESC';

  const isAsc = activeSortDirection === 'ASC';
  const highlightClasses = {
    header: isAsc
      ? 'bg-emerald-600/40 text-emerald-100 border-x border-t border-emerald-500/40 font-bold'
      : 'bg-indigo-600/40 text-indigo-100 border-x border-t border-indigo-500/40 font-bold',
    cell: isAsc
      ? 'bg-emerald-500/20 border-x border-emerald-500/20 font-semibold'
      : 'bg-indigo-500/20 border-x border-indigo-500/20 font-semibold',
  };

  const onSortChange = async (sortKey: string, direction: string) => {
    if (isLoading) return;

    // 1. Включаем флаг пагинации/сортировки для отображения лоадера
    setIsPaginationOrSorting(true);
    setIsLoading(true)

    // 2. Мгновенно подсвечиваем активную колонку
    setSortClickState({ column: sortKey, direction });

    // 3. ОБНОВЛЯЕМ URL В БРАУЗЕРЕ (сбрасываем страницу на 1)
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('sortColumn', sortKey);
    urlParams.set('sortDirection', direction);
    urlParams.set('page', '1');

    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newUrl);

    // 4. Теперь вызываем fetchData — она прочитает СВЕЖИЙ URL!
    await fetchData();
  };

  useEffect(() => {
    // Set up interval for periodic data fetching
    const intervalId = setInterval(
      () => {
        fetchData();
      },
      parseInt(settingsData.update_interval) * 1000
    );

    // Listen for filter changes
    const handleFilterChange = () => {
      // Reset to first page when filter changes
      setCurrentPage(1);
    };

    //       window.addEventListener('filterChanged', handleFilterChange);

    return () => {
      clearInterval(intervalId);
      //           window.removeEventListener('filterChanged', handleFilterChange);
    };
  }, []);

  const fetchData = async (showLoader = false) => {
    // Включаем лоадер, если передан флаг или если сработал локальный стейт
    if (showLoader || isPaginationOrSorting) {
      setIsLoading(true);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const currentFilterType = urlParams.get('filterType') || 'all';
    const searchParam = urlParams.get('search') || '';
    const sortColumn = urlParams.get('sortColumn') || 'tvc_score';
    const sortDirection = urlParams.get('sortDirection') || 'DESC';
    const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;

    try {
      let url = user
        ? `/api/fetch-validators-auth?page=${currentPageFromUrl}&filterType=${currentFilterType}&sortColumn=${sortColumn}&sortDirection=${sortDirection}&responseType=json`
        : `/api/scored-validators?page=${currentPageFromUrl}&filterType=${currentFilterType}&sortColumn=${sortColumn}&sortDirection=${sortDirection}&responseType=json`;

      if (searchParam) {
        url += `&search=${encodeURIComponent(searchParam)}`;
      }

      const response = await axios.get(url);
      setData(response.data.validatorsData);
      setTotalRecords(response.data.totalCount);

      if (!dataFetched) {
        setDataFetched(true);
        setIsLoading(false);
      }

      setSortClickState(null);
    } catch (error) {
      console.error('Error:', error);
      setSortClickState(null);
    } finally {
      // Гасим лоадер ТОЛЬКО ПОСЛЕ того, как пришел ответ и обновился стейт
      setIsLoading(false);
      setIsPaginationOrSorting(false);
    }
  };

  const renderCellContent = (columnName: string, validator: any) => {
    switch (columnName) {
      case 'Spy Rank':
        return <ValidatorSpyRank validator={validator} />;
      case 'Avatar':
        return validator.avatar_url || validator.avatar_file_url ? (
          <img
            src={validator.avatar_url || validator.avatar_file_url}
            alt={validator.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">SP</span>
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
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
            <span className="text-xs font-medium text-slate-200">
              Updating data...
            </span>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200 validator-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
            </th>
            <th>Actions</th>
            {getOrderedVisibleColumns().map(column => {
              const sortKey = SORT_KEY_MAP[column.name];
              const isSorted =
                !!sortKey && activeSortColumn === sortKey.toLowerCase();

              return (
                <TableHeaderCell
                  key={column.name}
                  title={column.name}
                  sortKey={sortKey}
                  activeSortColumn={activeSortColumn}
                  activeSortDirection={activeSortDirection}
                  isLoading={isLoading}
                  onSort={onSortChange}
                />
              );
            })}
          </tr>
        </thead>
        <tbody className={isLoading ? 'opacity-40 pointer-events-none' : ''}>
          {data.map(validator => (
            <tr
              key={validator.id}
              className={validator.is_highlighted ? 'bg-selected' : ''}
            >
              <td className="text-left text-white pl-[10px]">
                <input
                  type="checkbox"
                  checked={checkedIds.includes(validator.id)}
                  onChange={() => handleCheckboxChange(validator.id)}
                />
              </td>
              <td className="text-center text-white">
                <ValidatorActions
                  validator={validator}
                  onBanToggle={handleBanToggle}
                />
              </td>
              {getOrderedVisibleColumns().map((column, colIndex) => {
                const sortKey = SORT_KEY_MAP[column.name];
                const isSorted =
                  !!sortKey && activeSortColumn === sortKey.toLowerCase();

                return (
                  <td
                    key={`${validator.id}-${colIndex}`}
                    className={`text-white ${isSorted ? highlightClasses.cell : ''}`}
                  >
                    {renderCellContent(column.name, validator)}
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
