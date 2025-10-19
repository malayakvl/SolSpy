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
    faBan
} from '@fortawesome/free-solid-svg-icons';
import ValidatorCredits from "./Partials/ValidatorCredits";
import ValidatorRate from "./Partials/ValidatorRate";
import ValidatorActivatedStake from "./Partials/ValidatorActivatedStake";
import ValidatorUptime from "./Partials/ValidatorUptime";
import ValidatorSFDP from "./Partials/ValidatorSFDP";
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
                                    <button 
                                        className={`ban-button flex items-center ml-4 ${isBlocked ? 'bg-red-300 hover:bg-red-500' : 'bg-blue-300 hover:bg-blue-500'}`}
                                        onClick={() => {
                                            // Stake functionality would go here
                                            addToBlock();
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faBan} />
                                        <span className="ml-2">{isBlocked ? 'Unblock' : 'Block'}</span>
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
                                            <span className="break-all">
                                                <ValidatorSFDP validator={validatorData} epoch={epoch} />
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Vote Credits:</span>
                                            <span className="break-all"><ValidatorCredits epoch={epoch} validator={validatorData} /></span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Vote Rate:</span>
                                            <span className="break-all">
                                                <ValidatorRate epoch={epoch} validator={validatorData} settingsData={settingsData} totalStakeData={totalStakeData}  />
                                                {/* {actualVotes/approxExpectedVotes} */}
                                            </span>
                                        </li>
                                       
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">TVCs Earned:</span>
                                            <span className="break-all">{validatorData.earned_credits}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">TVC Rank:</span>
                                            <span className="break-all">{validatorData.tvc_rank}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Timely Vote Rate:</span>
                                            <span className="break-all">{(validatorData.tvr * 100).toFixed(2)}%</span>
                                        </li>

                                         <li className="flex items-start">
                                            <span className="font-medium mr-2">Jiito Score:</span>
                                            <span className="break-all">{validatorData.jiito_score}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Jiito Score (Voter):</span>
                                            <span className="break-all">{validatorData.jiito_score_voter}</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-medium mr-2">Jiito Score (Validator):</span>
                                            <span className="break-all">{validatorData.jiito_score_validator}</span>
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
                                            <span className="break-all">{validatorData.jito_commission !== null && validatorData.jito_commission !== undefined ? `${validatorData.jito_commission}%` : 'N/A'}</span>
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