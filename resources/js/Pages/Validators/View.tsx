import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import { toast } from 'react-toastify';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faStar,
    faBan,
    faEnvelope,
    faHeart,
    faMoneyBill,
    faEye,
    faScaleBalanced,
    faScaleUnbalanced,
    faBell,
    faFrog,
    faFire,
    faHouse,
    faCircleRadiation
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./Partials/ValidatorCredits";
import ValidatorRate from "./Partials/ValidatorRate";
import ValidatorActivatedStake from "./Partials/ValidatorActivatedStake";
import ValidatorUptime from "./Partials/ValidatorUptime";
import ValidatorSFDP from "./Partials/ValidatorSFDP";
import ValidatorTVCScore from "./Partials/ValidatorTVCScore";
import ValidatorWithdrawer from "./Partials/ValidatorWithdrawer";
import ValidatorJiitoScore from "./Partials/ValidatorJiitoScore";
import axios from 'axios';
import MapLayer from './Map';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import CountryFlag from "../../Components/CountryFlag";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

// Error boundary component for charts
class ChartErrorBoundary extends React.Component<{children: any}, {hasError: boolean}> {
  constructor(props: {children: any}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-red-500">Error loading chart component</div>;
    }

    return this.props.children;
  }
}

// Updated function to fetch validator metrics from the database via API
async function fetchValidatorMetrics(votePubkey, validatorIdentityPubkey) {
  try {
    const response = await axios.get('/api/validator-metrics', {
      params: {
        votePubkey: votePubkey,
        validatorIdentityPubkey: validatorIdentityPubkey
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching validator metrics:", error);
    return null;
  }
}

// New function to fetch historical metrics
async function fetchHistoricalMetrics(votePubkey, validatorIdentityPubkey) {
  try {
    const response = await axios.get('/api/historical-metrics', {
      params: {
        votePubkey: votePubkey,
        validatorIdentityPubkey: validatorIdentityPubkey
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching historical metrics:", error);
    return null;
  }
}

export default function Index({ validatorData, settingsData, totalStakeData }) {
    const appLang = useSelector(appLangSelector);
    const user = usePage().props.auth.user;
    const msg = new Lang({
        messages: lngVaidators,
        locale: appLang,
    });
    const epoch = useSelector(appEpochSelector);
    const validatorCredits = JSON.parse(validatorData.epoch_credits);
    const scheduleSlots = JSON.parse(validatorData.slots);
    const dbData = JSON.parse(validatorData.epoch_credits_history);
    const labelEpoch = dbData.map(function (item) {
        return item[0]
    });
    const [data, setData] = useState<any>(validatorData);
    const [historicalData, setHistoricalData] = useState<any>(null);
    const votePubkey = validatorData.vote_pubkey;
    const validatorIdentityPubkey = validatorData.node_pubkey;
    const [chartTab, setChartTab] = useState<string>('epoch_credits');
    const [isBlocked, setIsBlocked] = useState<boolean>(validatorData.blocked_id ? true : false);
    const [isInComparison, setIsInComparison] = useState(false);
    const [isInFavorites, setIsInFavorites] = useState(false);

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
    const dataEpoch = {
            labels: labelEpoch,
            datasets: [{
                label: 'Epoch',
                data: echochValues,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                pointBackgroundColor: 'rgba(153, 102, 255, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
            }]
        };
    const optionsLine = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Epoch Credits History',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      elements: {
        point: {
          radius: 3,
          hoverRadius: 6,
        },
        line: {
          tension: 0.4,
        }
      }
    };

    // Options for the self-stake history chart
    const optionsSelfStake = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Self-Stake History (Epochs 750-849)',
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Self-Stake (SOL)',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Epoch',
          },
          // For better readability with many data points
          ticks: {
            autoSkip: true,
            maxTicksLimit: 20, // Show at most 20 tick labels
          },
        },
      },
      elements: {
        point: {
          radius: 2, // Smaller points for better visualization with many data points
          hoverRadius: 6,
        },
        line: {
          tension: 0.4,
        }
      }
    };

    const addToBlock = async () => {
        const validatorId = validatorData.id;
        if (user?.id) {
            // Registered user - use API
            try {
                await axios.post('/api/ban-validator', {
                    validatorId: validatorId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                // setIsInFavorites(!isInFavorites);
                toast.success('Ban list updated', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                setIsBlocked(!isBlocked);
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to update ban list', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } else {
            // Unregistered user - use localStorage with max 5 items
            const banList = JSON.parse(localStorage.getItem('validatorBlocked') || '[]');
            
            if (banList.includes(validatorId)) {
                // Remove from favorites
                const updatedList = banList.filter(id => id !== validatorId);
                localStorage.setItem('validatorBlocked', JSON.stringify(updatedList));
                setIsBlocked(false);
                toast.info('Validator removed from block list', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                // Add to blockedlist
                if (banList.length >= 5) {
                    toast.error('Maximum 5 validators can be added to blocked for unregistered users', {
                        position: "top-right",
                        autoClose: 1000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    
                    return;
                }
                banList.push(validatorId);
                localStorage.setItem('validatorBlocked', JSON.stringify(banList));
                setIsBlocked(true);
                toast.success('Validator added to block list', {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        }
    }

    useEffect(() => {
        // Only run this in the browser, not during server-side rendering
        if (typeof window !== "undefined") {
            fetchValidatorMetrics(votePubkey, validatorIdentityPubkey)
                .then(metrics => {
                    // The SFDP status is now displayed directly in the UI using the ValidatorSFDP component
                })
                .catch(error => {
                    console.error("Error fetching validator metrics:", error);
                });
                
            // Fetch historical metrics for the chart
            fetchHistoricalMetrics(votePubkey, validatorIdentityPubkey)
                .then(data => {
                    setHistoricalData(data);
                })
                .catch(error => {
                    console.error("Error fetching historical metrics:", error);
                });
        }
    }, [votePubkey, validatorIdentityPubkey]); // Re-run when these values change

    // Prepare data for the self-stake history chart
    const selfStakeChartData = () => {
        if (!historicalData || !historicalData.selfStake || !historicalData.selfStake.history) {
            return null;
        }
        
        // Sort epochs numerically (not alphabetically)
        const epochs = Object.keys(historicalData.selfStake.history)
            .map(Number) // Convert to numbers
            .sort((a, b) => a - b); // Sort numerically
        
        // Map stake values in the correct order
        const stakeValues = epochs.map(epoch => historicalData.selfStake.history[epoch]);
        
        return {
            labels: epochs,
            datasets: [
                {
                    label: 'Self-Stake (SOL)',
                    data: stakeValues,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        };
    };

    const fetchData = async () => {
        try {
            // Build URL with all parameters
            let url = `/api/fetch-validators-auth`;
            
            const response = await axios.get(url);
            setData(response.data.validatorsData);
            
        } catch (error) {
            console.error('Error:', error);
            // Reset sort click state even if there's an error
        }
    };

    return (
        <AuthenticatedLayout header={<Head />}>
            <Head title={msg.get('validators.viewTitle')} />
            <div className="py-0">
                <div className="p-4 sm:p-8 mb-8 content-data bg-content text-sm">
                    <div className="validator-details">
                        <div>
                            <div className="mb-4">
                                <div className="flex items-center w-full justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold mb-0 mr-2 inline-block">{validatorData.name}</h2>
                                        <div className="ml-2 inline-block">
                                            <span className={`${validatorData.delinquent ? 'text-red-500 bg-red-100' : 'text-green-500 bg-green-100'} border rounded-lg px-2 py-1 text-[10px] font-semibold uppercase`}>
                                                {validatorData.delinquent ? 'Offline' : 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="cursor-pointer" onClick={() => addToCompare(validator.id)}>
                                            <FontAwesomeIcon 
                                                icon={isInComparison ? faScaleUnbalanced : faScaleBalanced} 
                                                className={`mr-2 ${isInComparison ? 'text-red-500' : ''}`}
                                            />
                                        </span>
                                        <span className="cursor-pointer" onClick={() => addToFavorite(validator.id)}>
                                            <FontAwesomeIcon 
                                                icon={faHeart} 
                                                className={`mr-2 ${isInFavorites ? 'text-red-500' : ''}`}
                                            />
                                        </span>
                                        <span>
                                            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                        </span>
                                        <span>
                                            <FontAwesomeIcon icon={faMoneyBill} className="mr-2" />
                                        </span>
                                        <span>
                                            <FontAwesomeIcon icon={faBell} className="mr-2" />
                                        </span>
                                        <button
                                            className="stake-button flex items-center ml-4"
                                            onClick={() => {
                                                // Stake functionality would go here
                                            }}
                                        >
                                            <span className="ml-2">Stake</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full justify-between mb-4 items-center">
                                <ul className="space-y-2 w-full">
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2 w-40 whitespace-nowrap">Activated stake:</span>
                                        <span className="flex-1">
                                            <ValidatorActivatedStake validator={validatorData} epoch={epoch} />
                                        </span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2 w-40 whitespace-nowrap">Identity:</span>
                                        <span className="break-all flex-1">{validatorData.node_pubkey}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2 w-40 whitespace-nowrap">Vote Key:</span>
                                        <span className="break-all flex-1">{validatorData.vote_pubkey}</span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2 w-40 whitespace-nowrap">Withdrawer:</span>
                                        <span className="break-all flex-1">
                                            <ValidatorWithdrawer votePubkey={validatorData.vote_pubkey} nodePubkey={validatorData.node_pubkey} />
                                        </span>
                                    </li>
                                </ul>
                                <div className="flex flex-col items-end justify-center h-full">
                                    <span className="text-[11px] block text-right">Solspy Awards</span>
                                    <div className="flex items-center star-block">
                                        <FontAwesomeIcon className="text-3xl active-star" icon={faStar} />
                                        <FontAwesomeIcon className="text-3xl active-star" icon={faStar} />
                                        <FontAwesomeIcon className="text-3xl active-star" icon={faStar} />
                                        <FontAwesomeIcon className="text-3xl" icon={faStar} />
                                        <FontAwesomeIcon className="text-3xl" icon={faStar} />
                                    </div>
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
                                        {validatorData.avatar_file_url ?   
                                            <img src={`${validatorData.avatar_file_url}`} alt="avatar" className="w-full" />
                                        : 
                                            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg h-[230px] flex items-center justify-center">
                                                <span className="text-gray-500">No avatar available</span>
                                            </div>
                                        }
                                        
                                    </div>
                                    <ul className="space-y-2 w-1/2 pl-2">
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Solspy Rank:</span>
                                            <span className="flex-1">
                                                {validatorData.spyRank}
                                                {/* <ValidatorActivatedStake validator={validatorData} epoch={epoch} /> */}
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">TVC Score:</span>
                                            <span className="break-all flex-1">
                                                <ValidatorTVCScore validator={validatorData} />
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Stake Pool:</span>
                                            <span className="break-all flex-1">
                                                <FontAwesomeIcon icon={faFrog} className="mr-[2px]" />
                                                <FontAwesomeIcon icon={faFire} className="mr-[2px]" />
                                                <FontAwesomeIcon icon={faHouse} className="mr-[2px]" />
                                                <FontAwesomeIcon icon={faCircleRadiation} className="mr-[2px]" />
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Inflation Commission:</span>
                                            <span className="break-all flex-1">
                                               {validatorData.jito_commission !== undefined ? `${(parseFloat(validatorData.jito_commission) / 100).toFixed(2)}%` : 'N/A'}
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">MEV Commission:</span>
                                            <span className="break-all flex-1">
                                               {validatorData.commission !== undefined ? `${parseFloat(validatorData.commission).toFixed(2)}%` : 'N/A'}
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Uptime:</span>
                                            <span className="break-all flex-1">
                                                <ValidatorUptime epoch={epoch} validator={validatorData} />
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Client:</span>
                                            <span className="break-all flex-1">
                                                {`${validatorData.version}  ${validatorData.software_client || ''}`}
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">SFDP Status:</span>
                                            <span className="break-all flex-1">
                                                <ValidatorSFDP validator={validatorData} epoch={epoch} />
                                            </span>
                                        </li>
                                        {/* <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Vote Credits:</span>
                                            <span className="break-all flex-1">
                                                <ValidatorCredits epoch={epoch} validator={validatorData} />
                                            </span>
                                        </li> */}
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Vote Rate:</span>
                                            <span className="break-all flex-1">
                                                {/* Debug logging */}
                                                {console.log('ValidatorRate Props in View:', {
                                                    validator: validatorData,
                                                    epoch: epoch,
                                                    settingsData: settingsData,
                                                    totalStakeData: totalStakeData
                                                })}
                                                <ValidatorRate validator={validatorData} epoch={epoch} settingsData={settingsData} totalStakeData={totalStakeData} />
                                                {/* {actualVotes/approxExpectedVotes} */}
                                            </span>
                                        </li>
                                       
                                        {/* <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">TVCs Earned:</span>
                                            <span className="break-all flex-1">{validatorData.earned_credits}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">TVC Rank:</span>
                                            <span className="break-all flex-1">{validatorData.tvc_rank}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Timely Vote Rate:</span>
                                            <span className="break-all flex-1">{(validatorData.tvr * 100).toFixed(2)}%</span>
                                        </li> */}

                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Jito Score:</span>
                                            <span className="break-all flex-1">
                                                <ValidatorJiitoScore validator={validatorData} epoch={epoch} />

                                            </span>
                                        </li>
                                        {/* <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Jiito Score (Voter):</span>
                                            <span className="break-all flex-1">{validatorData.jiito_score_voter}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Jiito Score (Validator):</span>
                                            <span className="break-all flex-1">{validatorData.jiito_score_validator}</span>
                                        </li> */}
                                    </ul>
                                </div>
                            </div>
                            
                            {/* Second 50% block - avatar */}
                            <div className="w-1/2 pl-4">
                                <div className="flex items-start">
                                    <ul className="space-y-2 w-1/2 pr-2">
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Website:</span>
                                            <span className="break-all flex-1">{validatorData.url}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Details:</span>
                                            <span className="break-all flex-1">{validatorData.details}</span>
                                        </li>
                                        <li className="flex items-start">   
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">Country:</span>
                                            <span className="break-all flex-1">
                                                <CountryFlag 
                                                    countryCode={validatorData.country_iso} 
                                                    countryName={validatorData.country} 
                                                    size="medium"
                                                    rounded={true}
                                                />
                                            </span>
                                        </li>
                                       
                                        
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">City:</span>
                                            <span className="break-all flex-1">{validatorData.city}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">ASN:</span>
                                            <span className="break-all flex-1">{validatorData.asn}</span>
                                        </li>
                                        
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2 w-40 whitespace-nowrap">IP:</span>
                                            <span className="break-all flex-1">{validatorData.ip}</span>
                                        </li>
                                    </ul>
                                    <div className="w-1/2 pl-2">
                                        {validatorData.has_screenshot ?   
                                            <img src={`/storage/site-screenshots/${validatorData.id}.png`} alt="screenshot" className="w-full" />
                                        : 
                                            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg h-[230px] flex items-center justify-center">
                                                <span className="text-gray-500">No screenshot available</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4 mt-4">
                            <div className="bg-[#170e23] rounded-lg p-5 flex-1">
                                <span className="text-xl font-bold mb-4 text-white mb-2 block">Account Assets</span>
                                <table className="w-full border border-gray-300">
                                    <thead>
                                        <tr className="border-b border-gray-300 bg-gray-100">
                                            <th className="text-left py-2 px-4">Identity</th>
                                            <th className="text-left py-2 px-4">Vote</th>
                                            <th className="text-left py-2 px-4">Withdrawer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-2 px-4 border-b border-gray-200">identity_value_1</td>
                                            <td className="py-2 px-4 border-b border-gray-200">vote_value_1</td>
                                            <td className="py-2 px-4 border-b border-gray-200">withdrawer_value_1</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-[#170e23] rounded-lg p-5 flex-1">
                                <div>Block 2</div>
                            </div>
                        </div>





                        <div className="flex mt-6">
                            <div className="w-1/2 w-[650px] h-[500px] mr-2">
                                <MapLayer validator={validatorData} />
                            </div>
                            <div className="w-1/2 ml-2">
                                <ul className="flex flex-row w-full border-b border-gray-300">
                                    <li onClick={() => setChartTab('stake')} className={`px-4 py-2 font-medium text-md cursor-pointer text-gray-500 hover:text-gray-700`}>Stake</li>
                                    <li onClick={() => setChartTab('stake_accounts')} className="px-4 py-2 font-medium text-md cursor-pointer text-gray-500 hover:text-gray-700">Stake Accounts</li>
                                    <li onClick={() => setChartTab('success_rate')} className="px-4 py-2 font-medium text-md cursor-pointer text-gray-500 hover:text-gray-700">Success Rate</li>
                                    <li onClick={() => setChartTab('block_rewards')} className="px-4 py-2 font-medium text-md cursor-pointer text-gray-500 hover:text-gray-700">Block Rewards</li>
                                    <li onClick={() => setChartTab('epoch_credits')} className={`px-4 py-2 font-medium text-md cursor-pointer ${chartTab === 'epoch_credits' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Epoch Credits</li>
                                </ul>
                                <div className={`w-full ${chartTab === 'epoch_credits' ? 'block' : 'hidden'}`}>
                                    <ChartErrorBoundary>
                                        <Line options={optionsLine} data={dataEpoch} />
                                    </ChartErrorBoundary>
                                </div>
                                <div className={`w-full ${chartTab === 'stake_accounts' ? 'block' : 'hidden'}`}>
                                    <ChartErrorBoundary>
                                        {selfStakeChartData() ? (
                                            <Line options={optionsSelfStake} data={selfStakeChartData()} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="text-center">
                                                    <div>Loading historical self-stake data...</div>
                                                </div>
                                            </div>
                                        )}
                                    </ChartErrorBoundary>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>

        </AuthenticatedLayout>
    );
}