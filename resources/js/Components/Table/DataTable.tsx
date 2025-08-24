import React, { useCallback, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeaders from '../../Lang/Datatable/translation';
import EmptyTable from '../../Components/Table/EmptyTable';
import { TableHeaders, PaginationType } from '../../Constants';
import { setPaginationAction, setSwitchToggleAction } from '../../Redux/Layout';
import {
  checkedIdsSelector,
  paginationSelectorFactory,
  switchHeaderSelector,
} from '../../Redux/Layout/selectors';

export default function DataTable({
  paginationType,
  children,
  totalAmount,
  sendRequest,
  switcherOnClick,
  hideBulk,
  sendDeleteRequest,
  sendCopyRequest,
}) {
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngHeaders,
    locale: appLang,
  });
  const { PRODUCTS } = PaginationType;
  let dropdownOptions = ['copy', 'delete'];
  const [loading, setLoading] = useState(false);
  const switchAllHeader = false;
  const [allChecked, setAllChecked] = useState(false);
  const headers = TableHeaders[paginationType];
  const dispatch = useDispatch();
  const { includes } = [PRODUCTS];
  const { limit, sort, column, offset, query, filters }: Layouts.Pagination =
    useSelector(paginationSelectorFactory(paginationType));
  let showIds: boolean = false;
  // showIds = includes(paginationType);

  const length = useMemo(
    () =>
      headers.reduce((acc, item) => {
        if (!item.subTitles?.length) return acc;
        return acc + item.subTitles.length;
      }, headers.length),
    [headers]
  );
  const isTwoRowsHeader = useMemo(
    () => headers.some(i => i.subTitles?.length),
    [headers]
  );

  const handleSwitchAction = (checked: boolean) => {
    // dispatch(setSwitchToggleAction(true));
    // dispatch(setSwitchHeaderAction(checked));
    // // dispatch(setSwitchToggleAction(null));
    // if (switcherRequest) {
    //     switcherRequest();
    // }
  };

  const handleAllChecked = () => {
    // if (!allChecked) {
    //     dispatch(checkAllIdsAction());
    // } else {
    //     dispatch(uncheckAllIdsAction());
    // }
    setAllChecked(!allChecked);
  };

  const setSort = useCallback(
    (event: React.SyntheticEvent): void => {
      const column = event.currentTarget.getAttribute('data-name') as string;
      const sort = event.currentTarget.getAttribute('data-direction') as string;
      dispatch(
        setPaginationAction({
          type: paginationType,
          modifier: { sort, column },
        })
      );
      dispatch(setSwitchToggleAction(null));
    },
    [paginationType, dispatch]
  );

  const renderTableHeader = () => {
    const getTh = item => (
      <th
        rowSpan={isTwoRowsHeader && !item.subTitles?.length ? 2 : 1}
        colSpan={item.subTitles?.length || 1}
        key={
          item.titleKey ? item.titleKey : Math.random().toString(16).slice(2)
        }
        className={`${item.className}`}
      >
        {item.className === 'option-switcher' && (
          <label
            htmlFor="switchAll"
            className="flex items-center cursor-pointer relative"
          >
            <input
              type="checkbox"
              id="switchAll"
              className="sr-only"
              checked={switchAllHeader}
              onChange={e => {
                handleSwitchAction(e.target.checked);

                if (switcherOnClick) {
                  switcherOnClick(e.target.checked);
                }
              }}
            />
            <div className="toggle-bg bg-gray-200 border border-gray-200 rounded-full dark:bg-gray-700 dark:border-gray-600" />
          </label>
        )}
        <div className="relative w-full inline-block">
          {item.sortKey && (
            <div className="sortable-block absolute top-[-9px] left-0">
              <div
                role="presentation"
                data-name={item.sortKey}
                data-direction="ASC"
                onClick={setSort}
                className={''}
              />
              <div
                role="presentation"
                data-name={item.sortKey}
                data-direction="DESC"
                onClick={setSort}
                className={''}
              />
            </div>
          )}
          <div
            className="inline-block"
            style={{ marginLeft: item.sortKey ? '30px' : '0' }}
          >
            {item.iconClass && (
              <div className="inline-block">
                <i className={`tbl-icon ${item.iconClass}`} />
              </div>
            )}
            {item.titleKey && (
              <div style={{ marginTop: '-2px' }} className="inline-block">
                {item.titleKey ? msg.get(item.titleKey) : ''}
              </div>
            )}
          </div>
        </div>
      </th>
    );

    return (
      <>
        <tr role="row">{headers.map(getTh)}</tr>
        {isTwoRowsHeader && (
          <tr role="row">
            {headers.map(item => {
              if (!item.subTitles?.length) return null;
              return item.subTitles.map(getTh);
            })}
          </tr>
        )}
      </>
    );
  };

  const renderTableBody = () => {
    if (loading) {
      return (
        <EmptyTable colSpan={length}>
          No record with selected criteria
        </EmptyTable>
      );
    }
    if (children?.length) return children;
    return (
      <EmptyTable colSpan={length}>
        {msg.get('datatable.emptyTable')}
      </EmptyTable>
    );
  };

  return (
    <div className="hscroll">
      <table className="data-table mt-5">
        <thead className="text-zinc-500 dark:text-zinc-400">
          {renderTableHeader()}
        </thead>
        <tbody>{renderTableBody()}</tbody>
      </table>
    </div>
  );
}
