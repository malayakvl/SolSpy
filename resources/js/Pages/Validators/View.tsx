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

const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};

const labels = Utils.months({count: 7});
const dataRnd = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => {
        return [Utils.rand(-100, 100), Utils.rand(-100, 100)];
      }),
      backgroundColor: Utils.CHART_COLORS.red,
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => {
        return [Utils.rand(-100, 100), Utils.rand(-100, 100)];
      }),
      backgroundColor: Utils.CHART_COLORS.blue,
    },
  ]
};

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

export default function Index({ validatorData }) {
    const appLang = useSelector(appLangSelector);
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);
    const dataChart = [
        { year: 2010, count: 10 },
        { year: 2011, count: 20 },
        { year: 2012, count: 15 },
        { year: 2013, count: 25 },
        { year: 2014, count: 22 },
        { year: 2015, count: 30 },
        { year: 2016, count: 28 },
    ];


    // const Map = ReactMapboxGl({
    //     accessToken:
    //         'pk.eyJ1IjoiZmFicmljOCIsImEiOiJjaWc5aTV1ZzUwMDJwdzJrb2w0dXRmc2d0In0.p6GGlfyV-WksaDV_KdN27A'
    // });

console.log(validatorData.name)

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
                                            <span className="break-all">{validatorData.uptime}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Client:</span>
                                            <span className="break-all">{validatorData.uptime}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">SFDP Status:</span>
                                            <span className="break-all">{validatorData.uptime}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Vote Rate:</span>
                                            <span className="break-all">{validatorData.uptime}</span>
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
                                            <span className="font-medium mr-2">Website:</span>
                                            <span className="break-all">{validatorData.url}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Details:</span>
                                            <span className="break-all">{validatorData.details}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Location:</span>
                                            <span className="break-all">{validatorData.country}</span>
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
                                <Bar options={options} data={dataRnd} />
                            </div>
                        </div>  
                    </div>
                    
                </div>
            </div>

        </AuthenticatedLayout>
    );
}
