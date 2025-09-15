import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import Dropdown from '../../Components/Form/Dropdown';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import ValidatorName from '../../Pages/Validators/Partials/ValidatorName';
import ValidatorUptime from '../../Pages/Validators/Partials/ValidatorUptime';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFire,
    faHouse,
    faFrog,
    faCircleRadiation
} from '@fortawesome/free-solid-svg-icons';

export default function ValidatorCard({validator, epoch, settingsData, totalStakeData, validators}) {
  const user = usePage().props.auth.user;
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngVaidators,
    locale: appLang,
  });

  return (
      <div className="flex flex-col v-card">
        <div class="flex flex-col h-[200px] items-center bg-white border md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <img 
                src={validator.avatar_url || validator.avatar_file_url} 
                alt={`${validator.name} avatar`} 
                className="w-auto h-full rounded-full p-2 h-[150px]"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // Create a fallback element
                    const fallback = document.createElement('div');
                    fallback.className = 'w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500';
                    fallback.textContent = '';
                    e.currentTarget.parentNode.appendChild(fallback);
                }}
            />
            <div class="flex flex-col justify-between p-2 leading-normal">
                <h5 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <ValidatorName validator={validator} noTruncate={true} />
                </h5>
                <div className="grid grid-cols-8 gap-1 text-[13px]">
                    <div>Rank</div>
                    <div>TVC</div>
                    <div >Stake Pool</div>
                    <div>INF %</div>
                    <div>MEV %</div>
                    <div>Uptime</div>
                    <div>Client</div>
                    <div>SPDF</div>

                    <div> - </div>
                    <div>{validator.tvcRank || 'N/A'}</div>
                    <div className="whitespace-nowrap px-1">
                        <FontAwesomeIcon icon={faFrog} className="mr-[2px]" />
                        <FontAwesomeIcon icon={faFire} className="mr-[2px]" />
                        <FontAwesomeIcon icon={faHouse} className="mr-[2px]" />
                        <FontAwesomeIcon icon={faCircleRadiation} className="mr-[2px]" />
                    </div>
                    <div>{validator.jito_commission !== undefined ? `${validator.jito_commission}%` : 'N/A'}</div>
                    <div>{validator.commission !== undefined ? `${validator.commission}%` : 'N/A'}</div>
                    <div><ValidatorUptime validator={validator} /></div>
                    <div>{validator.version || validator.software_version || 'N/A'}</div>
                    <div>SPDF</div>
                </div>
            </div>
        </div>
      </div>
  );
}
