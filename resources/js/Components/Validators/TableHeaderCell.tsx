import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

interface TableHeaderCellProps {
  title: string;
  sortKey?: string;
  activeSortColumn: string;
  activeSortDirection: string;
  isLoading: boolean;
  onSort: (sortKey: string, direction: string) => void;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  title,
  sortKey,
  activeSortColumn,
  activeSortDirection,
  isLoading,
  onSort,
}) => {
  // Если у колонки нет sortKey (например, Avatar), просто рендерим текст
  if (!sortKey) {
    return <th>{title}</th>;
  }
  const isCurrentColumn = activeSortColumn === sortKey.toLowerCase();
  const isAsc = isCurrentColumn && activeSortDirection === 'ASC';
  const isDesc = isCurrentColumn && activeSortDirection === 'DESC';

  const handleSortClick = (direction: string) => {
    if (!isLoading) {
      onSort(sortKey, direction);
    }
  };

  return (
    <th className="cursor-pointer select-none">
      <div className="flex items-center justify-between">
        <span>{title}</span>
        <div className="flex flex-col ml-2">
          <FontAwesomeIcon
            icon={faSortUp}
            className={`text-xs transition-colors ${
              isAsc
                ? 'text-blue-500 font-bold'
                : 'text-gray-400 hover:text-blue-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handleSortClick('ASC')}
          />
          <FontAwesomeIcon
            icon={faSortDown}
            className={`text-xs transition-colors ${
              isDesc
                ? 'text-blue-500 font-bold'
                : 'text-gray-400 hover:text-blue-400'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handleSortClick('DESC')}
          />
        </div>
      </div>
    </th>
  );
};
