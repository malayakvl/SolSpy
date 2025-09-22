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
import ValidatorSFDP from '../../Pages/Validators/Partials/ValidatorSFDP';

export default function ValidatorCard({validator, epoch, settingsData, totalStakeData, validators}) {
  const user = usePage().props.auth.user;
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngVaidators,
    locale: appLang,
  });

  return (
      <div className="flex flex-col v-card">
        <div className="flex flex-col h-[200px] items-center bg-white border md:flex-row hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
            <img 
                src={validator.avatar_url || validator.avatar_file_url} 
                alt={`${validator.name} avatar`} 
                className="w-auto rounded-full p-2 h-[140px]"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    // Create a fallback element
                    const fallback = document.createElement('div');
                    fallback.className = 'w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500';
                    fallback.textContent = '';
                    e.currentTarget.parentNode.appendChild(fallback);
                }}
            />
            <div className="flex flex-col justify-between p-2 leading-normal">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <ValidatorName validator={validator} noTruncate={true} />
                </h5>
                <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto_auto_auto] text-[14px] gap-4 rounded-lg">
                    <div className="font-bold text-center">Rank</div>
                    <div className="font-bold text-center">Tvc</div>
                    <div className="font-bold text-center">Stake Pool</div>
                    <div className="font-bold text-center">Inf%</div>
                    <div className="font-bold text-center">Mev %</div>
                    <div className="font-bold text-center">Uptime</div>
                    <div className="font-bold text-center">Client</div>
                    <div className="font-bold text-center">SFDP</div>
  
                    <div className="text-center">{validator.spyRank || 'N/A'}</div>
                    <div className="text-center">{validator.tvcRank || 'N/A'}</div>
                    <div className="text-center">
                        <FontAwesomeIcon icon={faFrog} className="mr-[2px]" />
                            <FontAwesomeIcon icon={faFire} className="mr-[2px]" />
                            <FontAwesomeIcon icon={faHouse} className="mr-[2px]" />
                            <FontAwesomeIcon icon={faCircleRadiation} className="mr-[2px]" />
                    </div>
                    <div className="text-center">
                        {validator.jito_commission !== undefined ? `${(parseFloat(validator.jito_commission) / 100).toFixed(2)}%` : 'N/A'}
                    </div>
                    <div className="text-center">
                        {validator.commission !== undefined ? `${(parseFloat(validator.commission) / 100).toFixed(2)}%` : 'N/A'}
                    </div>
                    <div className="text-center"><ValidatorUptime validator={validator} /></div>
                    <div className="text-center ">
                        <span className="bg-blue-500 text-white px-1 px-2 rounded-lg inline-block text-[12px]">
                            {validator.version || validator.software_version || 'N/A'}
                        </span>
                    </div>
                    <div className="text-center"><ValidatorSFDP validator={validator} epoch={epoch} type={'card'} /></div>
                </div>
                {/* <div className="grid grid-cols-8 gap-1 text-[13px]">
                    <div className="w-[60px] text-center border border-1 border-black">Rank</div>
                    <div className="w-[60px] text-center border border-1 border-black">TVC</div>
                    <div className="whitespace-nowrap min-w-[120px] text-center  border border-1 border-black">Stake Pool</div>
                    <div className="w-[60px] text-center  border border-1 border-black">INF %</div>
                    <div className="w-[60px] text-center  border border-1 border-black">MEV %</div>
                    <div className="w-[80px] text-center  border border-1 border-black">Uptime</div>
                    <div className="w-[80px] text-center  border border-1 border-black">Client</div>
                    <div className="whitespace-nowrap min-w-[90px] text-center">SPDF</div>

                    <div className="w-[60px] text-center">{validator.spyRank}</div>
                    <div className="w-[60px] text-center">{validator.tvcRank || 'N/A'}</div>
                    <div className="whitespace-nowrap px-1 min-w-[120px] text-center">
                        <FontAwesomeIcon icon={faFrog} className="mr-[2px]" />
                        <FontAwesomeIcon icon={faFire} className="mr-[2px]" />
                        <FontAwesomeIcon icon={faHouse} className="mr-[2px]" />
                        <FontAwesomeIcon icon={faCircleRadiation} className="mr-[2px]" />
                    </div>
                    <div className="w-[60px] text-center">{validator.jito_commission !== undefined ? `${(parseFloat(validator.jito_commission) / 100).toFixed(2)}%` : 'N/A'}</div>
                    <div className="w-[60px] text-center">{validator.commission !== undefined ? `${(parseFloat(validator.commission) / 100).toFixed(2)}%` : 'N/A'}</div>
                    <div className="w-[80px] text-center"><ValidatorUptime validator={validator} /></div>
                    <div className="w-[80px] text-center">{validator.version || validator.software_version || 'N/A'}</div>
                    <div className="whitespace-nowrap min-w-[90px] text-center"><ValidatorSFDP validator={validator} epoch={epoch} /></div>
                </div> */}
            </div>
        </div>
      </div>
  );
}
