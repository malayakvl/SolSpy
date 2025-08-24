import React, { useState } from 'react';
import Lang from 'lang.js';
import { useDispatch, useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import lngScheduler from '../../Lang/Scheduler/translation';
// import { updateFormEventAction } from '../../redux/scheduler/actions';

export default function StatusIcon() {
  // const t = useTranslations();
  const dispatch = useDispatch();
  const statuses = [
    { name: 'planned', color: '#4c95f5' },
    { name: 'confirm', color: '#eb9d17' },
    { name: 'done', color: '#7d17eb' },
    { name: 'missed', color: '#fae73c' },
    { name: 'postponed', color: '#3cfafa' },
    { name: 'noanswer', color: '#ff5722' },
    { name: 'late', color: '#ff21ed' },
    { name: 'inclicnic', color: '#2971ba' },
    { name: 'incabinet', color: '#37ff21' },
    { name: 'decline', color: '#222223' },
  ];
  const [eventStatus, setEventStatus] = useState({
    name: 'planned',
    color: '#4c95f5',
  });
  const [showStatus, setShowStatus] = useState(false);
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngScheduler,
    locale: appLang,
  });

  return (
    <div
      className="inline-block w-[15px] h-[15px] border mr-[5px]"
      style={{ background: eventStatus.color }}
    ></div>
  );
}
