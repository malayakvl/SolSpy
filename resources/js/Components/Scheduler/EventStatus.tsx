import React, { useState } from 'react';
import Lang from 'lang.js';
import { useDispatch, useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import lngScheduler from '../../Lang/Scheduler/translation';
import { setScheduleStatusAction } from '../../Redux/Scheduler';
import { SchedulerStatuses } from '../../Constants';

export default function EventStatus({defaultStatus = 'planned', defaultColor= '#4c95f5'}) {
  const dispatch = useDispatch();
  const statuses = SchedulerStatuses;
  const [eventStatus, setEventStatus] = useState({
    name: defaultStatus,
    color: defaultColor,
  });
  const [showStatus, setShowStatus] = useState(false);
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngScheduler,
    locale: appLang,
  });

  return (
    <div className="mb-0 relative grid justify-items-end mt-[-35px]">
      <button
        className="text-center inline-flex text-xs font-bold"
        style={{ color: eventStatus.color }}
        onClick={() => setShowStatus(!showStatus)}
        type="button"
      >
        <div
          className="inline-block w-[15px] h-[15px] border mr-[5px]"
          style={{
            background: eventStatus.color,
            borderColor: eventStatus.color,
          }}
        ></div>
        {msg.get(`scheduler.statuses.${eventStatus.name}`)}
      </button>

      {showStatus && (
        <div className="top-3 text-xs z-10 w-44 text-base list-none bg-white rounded divide-y divide-gray-100 shadow absolute scheduler-status">
          <ul
            className="py-1 text-xs scheduler-status"
            aria-labelledby="dropdownLeftButton"
          >
            {statuses.map((status: any) => (
              <li
                key={status.name}
                role="presentation"
                onClick={() => {
                  setShowStatus(false);
                  setEventStatus(status);
                  dispatch(setScheduleStatusAction(status));
                }}
              >
                <span
                  style={{ color: status.color }}
                  className="block py-2 px-4 text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {msg.get(`scheduler.statuses.${status.name}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
