import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import React, { useEffect, useState, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBan,
    faCheck,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./Partials/ValidatorCredits";
import ValidatorRate from "./Partials/ValidatorRate";
import ValidatorActions from "./Partials/ValidatorActions";
import ValidatorName from "./Partials/ValidatorName";
import ValidatorActivatedStake from "./Partials/ValidatorActivatedStake";
import ValidatorUptime from "./Partials/ValidatorUptime";
import ValidatorScore from "./Partials/ValidatorScore";
import axios from 'axios';
import ValidatorSpyRank from "./Partials/ValidatorSpyRank";
// import Utils from "Utils.ts";
// import Map, { GeolocateControl } from 'react-map-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
import MapLayer from './Map';
import { faker } from '@faker-js/faker';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

// Simple implementation of Utils functions
const Utils = {
  months: ({ count }: { count: number }) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months.slice(0, count);
  },
  rand: (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  CHART_COLORS: {
    red: 'rgba(255, 99, 132, 0.5)',
    blue: 'rgba(53, 162, 235, 0.5)',
  }
};


export default function Index({ validatorData, settingsData }) {
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);
    const dbData = JSON.parse(validatorData.epoch_credits_history);
    const labelEpoch = dbData.map(function (item) {
        return item[0]
    });
    const [data, setData] = useState<any>(validatorData);

    const formatSOL = (lamports) => {
        // Конвертация лампорта в SOL
        const sol = lamports / 1e9; // 1e9 = 1,000,000,000
        // Конвертация SOL в K SOL (тысячи SOL)
        const kSol = sol / 1e3; // 1e3 = 1000
        // Округление до двух десятичных знаков и форматирование
        return kSol.toFixed(2);
    }

    const echochValues = dbData.map(function (item) {
        return (item[1]/1000000)
    });

    const labels = Utils.months({count: 7});
    const dataEpoch = {
            labels: labelEpoch,
            datasets: [{
                label: 'Epoch',
                data: echochValues,
                backgroundColor: [
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        };

    const fetchData = async () => {
        // Get filter value and other parameters from current URL
        const urlParams = new URLSearchParams(window.location.search);
        const currentFilterType = urlParams.get('filterType') || 'all';
        const searchParam = urlParams.get('search') || '';
        const sortColumn = urlParams.get('sortColumn') || 'id';
        const sortDirection = urlParams.get('sortDirection') || 'ASC';
        const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
        
        try {
            // Build URL with all parameters
            let url = `/api/fetch-validators`;
            if (searchParam) {
                url += `&search=${encodeURIComponent(searchParam)}`;
            }
            
            const response = await axios.get(url);
            // console.log(response.data.validatorsData)
            setData(response.data.validatorsData);
            
        } catch (error) {
            console.error('Error:', error);
            // Reset sort click state even if there's an error
        }
    };

    useEffect(() => {
        // const intervalId = setInterval(fetchData(currentPage), 15000);
        
        const intervalId = setInterval(() => {
            // Get current page from URL to ensure we're using the latest page
            const urlParams = new URLSearchParams(window.location.search);
            const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
            fetchData();
        }, parseInt(settingsData.update_interval)*1000);
        
        
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('filterChanged', handleFilterChange);
        };
    }, []);

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('validators.viewTitle')} />
            <div className="py-0 text-gray-900">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content text-sm">
                    <h2 className="text-2xl font-bold">{msg.get('validators.viewTitle')}&nbsp;</h2>
                    <div className="validator-details">
                        <div>
                            <div className="mb-4">
                                <div className="flex items-center">
                                    <h2 className="text-xl font-bold mb-0">{validatorData.name}</h2>
                                    <button 
                                        className="stake-button flex items-center ml-4"
                                        onClick={() => {
                                            // Stake functionality would go here
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                        <span className="ml-2">Stake</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex w-full justify-between mb-4 items-center">
                                <ul className="space-y-2">
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2">Activated stake:</span>
                                        <ValidatorActivatedStake validator={validatorData} epoch={epoch} />
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2">Identity:</span>
                                        <span className="break-all">{validatorData.node_pubkey}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2">Vote Key:</span>
                                        <span className="break-all">{validatorData.vote_pubkey}</span>
                                    </li>
                                </ul>
                                <div className="flex items-center star-block">
                                    <FontAwesomeIcon className="text-3xl" icon={faStar} />
                                    <FontAwesomeIcon className="text-3xl" icon={faStar} />
                                    <FontAwesomeIcon className="text-3xl" icon={faStar} />
                                    <FontAwesomeIcon className="text-3xl" icon={faStar} />
                                    <FontAwesomeIcon className="text-3xl" icon={faStar} />
                                </div>
                            </div>
                        </div> 
                    </div>
                    <div>
                        <div className="flex mt-6">
                            {/* First 50% block - screenshot and details side by side */}
                            <div className="w-1/2 pr-4">
                                <div className="flex items-start">
                                    <div className="w-1/2 pr-2">
                                        {validatorData.has_screenshot ?   
                                            <img src={`/storage/site-screenshots/${validatorData.id}.png`} alt="screenshot" className="w-full mt-3" />
                                        : 
                                            <div className="text-gray-500">No screenshot available</div>
                                        }
                                    </div>
                                    <ul className="space-y-2 w-1/2 pl-2">
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Activated stake:</span>
                                            <ValidatorActivatedStake validator={validatorData} epoch={epoch} />
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Identity:</span>
                                            <span className="break-all">{validatorData.node_pubkey}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Vote Key:</span>
                                            <span className="break-all">{validatorData.vote_pubkey}</span>
                                        </li>
                                         <li className="flex items-start">
                                            <span className="font-medium mr-2">Uptime:</span>
                                            <span className="break-all">
                                                <ValidatorUptime epoch={epoch} validator={validatorData} />
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Client:</span>
                                            <span className="break-all">
                                                {`${validatorData.version}  ${validatorData.software_client || ''}`}
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">SFDP Status:</span>
                                            <span className="break-all">{validatorData.uptime}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Vote Credits:</span>
                                            <span className="break-all"><ValidatorRate epoch={epoch} validator={validatorData} /></span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Vote Rate:</span>
                                            <span className="break-all"></span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Jito Score:</span>
                                            <span className="break-all">{validatorData.uptime}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            
                            {/* Second 50% block - avatar */}
                            <div className="w-1/2 pl-4">
                                <div className="flex items-start">
                                    <ul className="space-y-2 w-1/2 pr-2">
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">MEV Commission:</span>
                                            <span className="break-all">{validatorData.commission !== null && validatorData.commission !== undefined ? `${validatorData.commission}%` : 'N/A'}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Inflation Commission:</span>
                                            <span className="break-all">{validatorData.jito_commission !== null && validatorData.jito_commission !== undefined ? `${validatorData.jito_commission/10}%` : 'N/A'}</span>
                                        </li>
                                        <li>
                                            <span className="font-medium mr-2">Inflation Commission:</span>
                                            <span className="break-all">
                                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Country:</span>
                                            <span className="break-all">{validatorData.country_iso} {validatorData.country}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">City:</span>
                                            <span className="break-all">{validatorData.city}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">ASN:</span>
                                            <span className="break-all">{validatorData.asn}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Website:</span>
                                            <span className="break-all">{validatorData.url}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Details:</span>
                                            <span className="break-all">{validatorData.details}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">IP:</span>
                                            <span className="break-all">{validatorData.ip}</span>
                                        </li>
                                    </ul>
                                    <div className="w-1/2 pl-2">
                                        {validatorData.avatar_file_url ?   
                                            <img src={`${validatorData.avatar_file_url}`} alt="avatar" className="w-full mt-3" />
                                        : 
                                            <div className="text-gray-500">No avatar available</div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex mt-6">
                            <div className="w-1/2 w-[650px] h-[500px]">
                                <MapLayer validator={validatorData} />
                            </div>
                            <div className="w-1/2">
                                <Bar options={options} data={dataEpoch} />
                            </div>
                        </div>  
                    </div>
                    
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
