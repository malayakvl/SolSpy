import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import { toast } from 'react-toastify';
import lngVaidators from '../../Lang/Validators/translation';
import { useSelector } from 'react-redux';
import { appEpochSelector, appLangSelector } from '../../Redux/Layout/selectors';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Connection, PublicKey } from '@solana/web3.js';
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
import { getWithdrawerFromMyValidator } from '../../utils/solana';
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

// Error boundary for charts
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

export default function Index({ validatorData, settingsData, totalStakeData }) {
    const appLang = useSelector(appLangSelector);
    const user = usePage().props.auth.user;
    const msg = new Lang({ messages: lngVaidators, locale: appLang });
    const epoch = useSelector(appEpochSelector);
    const validatorCredits = JSON.parse(validatorData.epoch_credits);
    const scheduleSlots = JSON.parse(validatorData.slots);
    const dbData = JSON.parse(validatorData.epoch_credits_history);
    const labelEpoch = dbData.map(item => item[0]);

    const [data, setData] = useState<any>(validatorData);
    const [historicalData, setHistoricalData] = useState<any>(null);
    const votePubkey = validatorData.vote_pubkey;
    const validatorIdentityPubkey = validatorData.node_pubkey;
    const [chartTab, setChartTab] = useState<string>('epoch_credits');
    const [isBlocked, setIsBlocked] = useState<boolean>(validatorData.blocked_id ? true : false);
    const [isInComparison, setIsInComparison] = useState(false);
    const [isInFavorites, setIsInFavorites] = useState(false);
    const [nextSlots, setNextSlots] = useState<Array<{slot: number | null, timeLeft: string, date: string}>>([]);
    const [loadingSlots, setLoadingSlots] = useState<boolean>(true);
    const [skippedData, setSkippedData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [skipData, setSkipData] = useState<any>(null);
    const [leaderData, setLeaderData] = useState<any>(null);
    const [loadingLeader, setLoadingLeader] = useState(true);
    const [withdrawer, setWithdrawer] = useState<string | null>(null);
    const [loadingWithdrawer, setLoadingWithdrawer] = useState(true);
    const [errorWithdrawer, setErrorWithdrawer] = useState(false);

    const formatSOL = (lamports) => {
        const kSol = (lamports / 1e9) / 1e3;
        return kSol.toFixed(2);
    };
    const echochValues = dbData.map(item => item[1] / 1_000_000);
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
        plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Epoch Credits History' } },
        scales: { y: { beginAtZero: true } },
        elements: { point: { radius: 3, hoverRadius: 6 }, line: { tension: 0.4 } }
    };

    const optionsSelfStake = {
        responsive: true,
        plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Self-Stake History (Epochs 750-849)' } },
        scales: {
            y: { beginAtZero: false, title: { display: true, text: 'Self-Stake (SOL)' } },
            x: { title: { display: true, text: 'Epoch' }, ticks: { autoSkip: true, maxTicksLimit: 20 } }
        },
        elements: { point: { radius: 2, hoverRadius: 6 }, line: { tension: 0.4 } }
    };

    const addToBlock = async () => {
        const validatorId = validatorData.id;
        if (user?.id) {
            try {
                await axios.post('/api/ban-validator', { validatorId }, {
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
                });
                toast.success('Ban list updated', { position: "top-right", autoClose: 2000 });
                setIsBlocked(!isBlocked);
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to update ban list', { position: "top-right", autoClose: 3000 });
            }
        } else {
            const banList = JSON.parse(localStorage.getItem('validatorBlocked') || '[]');
            if (banList.includes(validatorId)) {
                const updatedList = banList.filter(id => id !== validatorId);
                localStorage.setItem('validatorBlocked', JSON.stringify(updatedList));
                setIsBlocked(false);
                toast.info('Validator removed from block list', { position: "top-right", autoClose: 2000 });
            } else {
                if (banList.length >= 5) {
                    toast.error('Maximum 5 validators can be added to blocked for unregistered users', { position: "top-right", autoClose: 1000 });
                    return;
                }
                banList.push(validatorId);
                localStorage.setItem('validatorBlocked', JSON.stringify(banList));
                setIsBlocked(true);
                toast.success('Validator added to block list', { position: "top-right", autoClose: 2000 });
            }
        }
    };

    useEffect(() => {
        if (!validatorData?.node_pubkey) return; // защита от undefined

        const fetchLeaderSlots = async () => {
            setLoadingLeader(true);
            try {
                const res = await fetch(`/api/validator-leader-slots?node_pubkey=${validatorData.node_pubkey}`);
                const json = await res.json();
                setLeaderData(json);
            } catch (e) {
                console.error("Leader slots fetch failed:", e);
            } finally {
                setLoadingLeader(false);
            }
        };

        fetchLeaderSlots();
        const interval = setInterval(fetchLeaderSlots, 30_000);
        return () => clearInterval(interval);
    }, [validatorData?.node_pubkey]);

    useEffect(() => {
        if (!validatorData?.vote_pubkey) return;

        const fetchWithdrawer = async () => {
            setLoadingWithdrawer(true);
            try {
                const withdrawerValue = await getWithdrawerFromMyValidator(validatorData.vote_pubkey);
                setWithdrawer(withdrawerValue);
            } catch (e) {
                console.error("Withdrawer fetch failed:", e);
                setErrorWithdrawer(true);
            } finally {
                setLoadingWithdrawer(false);
            }
        };

        fetchWithdrawer();
    }, [validatorData?.vote_pubkey]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            fetchValidatorMetrics(votePubkey, validatorIdentityPubkey).catch(console.error);
            fetchHistoricalMetrics(votePubkey, validatorIdentityPubkey)
                .then(setHistoricalData)
                .catch(console.error);
        }
    }, [votePubkey, validatorIdentityPubkey]);

    const selfStakeChartData = () => {
        if (!historicalData?.selfStake?.history) return null;
        const epochs = Object.keys(historicalData.selfStake.history).map(Number).sort((a, b) => a - b);
        const stakeValues = epochs.map(epoch => historicalData.selfStake.history[epoch]);
        return { labels: epochs, datasets: [{ label: 'Self-Stake (SOL)', data: stakeValues, fill: false, borderColor: 'rgb(75, 192, 192)', tension: 0.1 }] };
    };


    // === НОВАЯ ФУНКЦИЯ: Получение следующих слотов ===
const getMyNextLeaderSlots = async () => {
    try {
        setLoadingSlots(true);

        const { data } = await axios.get('/api/validator-next-slots', {
            params: { node_pubkey: validatorData.node_pubkey }
        });

        const slots = data?.next_slots || [];

        // ❌ Нет слотов → показываем сообщение
        if (!slots.length) {
            setNextSlots([
                {
                    slot: null,
                    timeLeft: null,
                    date: data?.message || 'Нет слотов'
                }
            ]);
        } else {
            const s = slots[0];

            // ✅ Нормализация данных в единый формат
            const rawTime = s.timeLeft || s.eta || null;
            setNextSlots([
                {
                    slot: s.absolute_slot,
                    windowMinutes: Math.max(0, Math.round((s.eta_seconds / 60) - 45)),
                    dateWindow: new Date(new Date(s.eta_local) - 45 * 60 * 1000).toLocaleString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    }),
                    timeLeft: formatTimeLeft(s.eta_seconds),
                    date: s.eta_local
                }
            ]);
            
        }
    } catch (err) {
        console.error('Ошибка API:', err);
        setNextSlots([
            {
                slot: null,
                timeLeft: null,
                date: 'Ошибка сервера'
            }
        ]);
    } finally {
        setLoadingSlots(false);
    }
};


    const formatTimeLeft = (seconds) => {
        if (!seconds) return '—';

        const s = Math.floor(seconds);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;

        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${sec}s`;
        return `${sec}s`;
    };

    // === Запуск и автообновление ===
    useEffect(() => {
        if (validatorData?.node_pubkey) {
            getMyNextLeaderSlots();
            const interval = setInterval(getMyNextLeaderSlots, 12_000);
            return () => clearInterval(interval);
        }
    }, [validatorData.node_pubkey]);

    useEffect(() => {
        const fetchSkipped = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/validator-skipped-slots', {
                    params: { node_pubkey: validatorData.node_pubkey }
                });
                console.log(res)
                
                setSkippedData(res.data);
                setSkipData(res.data); // ✅ Fix added here

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSkipped();
        const interval = setInterval(fetchSkipped, 30_000); // каждые 30 сек
        return () => clearInterval(interval);
    }, [validatorData.node_pubkey]);

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
                                        <span className="cursor-pointer" onClick={() => addToBlock()}>
                                            <FontAwesomeIcon icon={isBlocked ? faBan : faCheck} className={`mr-2 ${isBlocked ? 'text-red-500' : ''}`} />
                                        </span>
                                        <span className="cursor-pointer" onClick={() => setIsInComparison(!isInComparison)}>
                                            <FontAwesomeIcon icon={isInComparison ? faScaleUnbalanced : faScaleBalanced} className={`mr-2 ${isInComparison ? 'text-red-500' : ''}`} />
                                        </span>
                                        <span className="cursor-pointer" onClick={() => setIsInFavorites(!isInFavorites)}>
                                            <FontAwesomeIcon icon={faHeart} className={`mr-2 ${isInFavorites ? 'text-red-500' : ''}`} />
                                        </span>
                                        <span><FontAwesomeIcon icon={faEnvelope} className="mr-2" /></span>
                                        <span><FontAwesomeIcon icon={faMoneyBill} className="mr-2" /></span>
                                        <span><FontAwesomeIcon icon={faBell} className="mr-2" /></span>
                                        <button className="stake-button flex items-center ml-4">
                                            <span className="ml-2">Stake</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full justify-between mb-4 items-center">
                                <ul className="space-y-2 w-full">
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2 w-40 whitespace-nowrap">Activated stake:</span>
                                        <span className="flex-1"><ValidatorActivatedStake validator={validatorData} epoch={epoch} /></span>
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
                                        <span className="break-all flex-1 text-gray-300">
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

                    <div className="flex mt-6">
                        <div className="w-1/2 pr-4">
                            <div className="flex items-start">
                                <div className="w-1/2 pr-2">
                                    {validatorData.avatar_file_url ? (
                                        <img src={`${validatorData.avatar_file_url}`} alt="avatar" className="w-full" />
                                    ) : (
                                        <div className="w-full border-2 border-dashed border-gray-300 rounded-lg h-[230px] flex items-center justify-center">
                                            <span className="text-gray-500">No avatar available</span>
                                        </div>
                                    )}
                                </div>
                                <ul className="space-y-2 w-1/2 pl-2">
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Solspy Rank:</span><span className="flex-1">{validatorData.spyRank}</span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">TVC Score:</span><span className="break-all flex-1"><ValidatorTVCScore validator={validatorData} /></span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Stake Pool:</span><span className="break-all flex-1"><FontAwesomeIcon icon={faFrog} className="mr-[2px]" /><FontAwesomeIcon icon={faFire} className="mr-[2px]" /><FontAwesomeIcon icon={faHouse} className="mr-[2px]" /><FontAwesomeIcon icon={faCircleRadiation} className="mr-[2px]" /></span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Inflation Commission:</span><span className="break-all flex-1">{validatorData.jito_commission !== undefined ? `${(parseFloat(validatorData.jito_commission) / 100).toFixed(2)}%` : 'N/A'}</span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">MEV Commission:</span><span className="break-all flex-1">{validatorData.commission !== undefined ? `${parseFloat(validatorData.commission).toFixed(2)}%` : 'N/A'}</span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Uptime:</span><span className="break-all flex-1"><ValidatorUptime epoch={epoch} validator={validatorData} /></span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Client:</span><span className="break-all flex-1">{`${validatorData.version} ${validatorData.software_client || ''}`}</span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">SFDP Status:</span><span className="break-all flex-1"><ValidatorSFDP validator={validatorData} epoch={epoch} /></span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Vote Rate:</span><span className="break-all flex-1"><ValidatorRate validator={validatorData} epoch={epoch} settingsData={settingsData} totalStakeData={totalStakeData} /></span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Jito Score:</span><span className="break-all flex-1"><ValidatorJiitoScore validator={validatorData} epoch={epoch} /></span></li>
                                </ul>
                            </div>
                        </div>

                        <div className="w-1/2 pl-4">
                            <div className="flex items-start">
                                <ul className="space-y-2 w-1/2 pr-2">
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Website:</span><span className="break-all flex-1">{validatorData.url}</span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Details:</span><span className="break-all flex-1">{validatorData.details}</span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">Country:</span><span className="break-all flex-1"><CountryFlag countryCode={validatorData.country_iso} countryName={validatorData.country} size="medium" rounded={true} /></span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">City:</span><span className="break-all flex-1">{validatorData.city}</span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">ASN:</span><span className="break-all flex-1">{validatorData.asn}</span></li>
                                    <li className="flex items-start"><span className="font-medium mr-2 w-40 whitespace-nowrap">IP:</span><span className="break-all flex-1">{validatorData.ip}</span></li>
                                </ul>
                                <div className="w-1/2 pl-2">
                                    {validatorData.has_screenshot ? (
                                        <img src={`/storage/site-screenshots/${validatorData.id}.png`} alt="screenshot" className="w-full" />
                                    ) : (
                                        <div className="w-full border-2 border-dashed border-gray-300 rounded-lg h-[230px] flex items-center justify-center">
                                            <span className="text-gray-500">No screenshot available</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-4">
                        <div className="w-1/2">
                            {/* === ALL SLOTS IN ONE CONTAINER === */}
                            <div className="bg-[#170e23] rounded-lg p-5 flex-1 flex flex-col space-y-4">
                                {/* === LEADER SLOTS === */}
                                <div>
                                    <div className="flex items-center space-x-2 w-full">
                                        <span className="w-32 text-right text-gray-300">Leader Slots</span>

                                        {loadingLeader || !leaderData ? (
                                            <div className="flex-grow relative bg-gray-800/40 rounded-full h-2.5 overflow-hidden border border-gray-700 flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">Loading...</span>
                                            </div>
                                        ) : (
                                            <div className="flex-grow relative bg-gray-800/40 rounded-full h-2.5 overflow-hidden border border-gray-700">

                                                {/* Total progress (expected slots) */}
                                                <div
                                                    className="absolute left-0 h-full bg-gray-600/40"
                                                    style={{
                                                        width: `${(leaderData.leader_slots / leaderData.expected_slots) * 100}%`
                                                    }}
                                                />

                                                {/* Produced slots */}
                                                <div
                                                    className="absolute left-0 h-full bg-green-500"
                                                    style={{ width: `${leaderData.produced_rate}%` }}
                                                />

                                                {/* Skipped slots */}
                                                <div
                                                    className="absolute left-0 h-full bg-red-500/80"
                                                    style={{ width: `${leaderData.skip_rate}%` }}
                                                />

                                                {/* Overlay text */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white drop-shadow-md">
                                                        {leaderData.leader_slots} / {leaderData.expected_slots}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Numbers under bar */}
                                    {leaderData && !loadingLeader && (
                                        <div className="flex flex-col text-right text-[11px] leading-tight">
                                            <span className="text-gray-400">
                                                Produced: <span className="text-green-400">{leaderData.produced_slots}</span>
                                                &nbsp;•&nbsp; 
                                                Skipped: <span className="text-red-400">{leaderData.skipped_slots}</span>
                                            </span>
                                            <span className="text-gray-500">
                                                Epoch {leaderData.epoch} — {leaderData.epoch_progress}%
                                            </span>
                                        </div>
                                    )}
                                    {!leaderData && (
                                        <div className="flex flex-col text-right text-[11px] leading-tight">
                                            <span className="text-gray-400">&nbsp;</span>
                                            <span className="text-gray-500">&nbsp;</span>
                                        </div>
                                    )}
                                </div>

                                {/* === SKIPPED SLOTS === */}
                                <div>
                                    <div className="flex items-center space-x-2 w-full">
                                        <span className="w-32 text-right text-gray-300">Skipped Slots</span>
            
                                        <div className="flex-grow relative bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                            {/* Produced (зелёный) */}
                                            <div
                                                className="absolute left-0 h-full bg-green-500 transition-all duration-500 ease-in-out"
                                                style={{ width: skipData ? `${skipData.produced_rate || 0}%` : '0%' }}
                                            />
                                            
                                            {/* Skipped (красный) */}
                                            <div
                                                className="absolute right-0 h-full bg-red-500 transition-all duration-500 ease-in-out"
                                                style={{ width: skipData ? `${skipData.skip_rate || 0}%` : '0%' }}
                                            />
                                            
                                            {/* Процент по центру */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white drop-shadow-md">
                                                    {skipData ? `${skipData.skip_rate}%` : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Цифры + прогресс эпохи */}
                                    <div className="flex flex-col text-right text-xs">
                                        <span className="text-gray-400">
                                            {skipData ? `${skipData.skipped_slots}/${skipData.past_slots || skipData.leader_slots}` : '—'}
                                        </span>
                                        <span className="text-gray-500">
                                            Epoch {skipData?.epoch}: {skipData?.epoch_progress || 0}%
                                        </span>
                                    </div>
                                </div>
                            
                                {/* === PRODUCED SLOTS === */}
                                <div>
                                    <div className="flex items-center space-x-2 w-full">
                                        <span className="w-32 text-right text-gray-300">Produced Slots</span>
                                        
                                        <div className="flex-grow relative bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                            {/* Produced (зелёный слева) */}
                                            <div
                                                className="absolute left-0 h-full bg-green-500 transition-all duration-500 ease-in-out"
                                                style={{ width: skipData ? `${skipData.produced_rate}%` : '0%' }}
                                            />
                                            {/* Skipped (красный фон, полупрозрачный) */}
                                            <div
                                                className="absolute left-0 h-full bg-red-500 opacity-30 transition-all duration-500 ease-in-out"
                                                style={{ width: skipData ? `${skipData.skip_rate}%` : '0%' }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-white drop-shadow-md">
                                                    {skipData ? `${skipData.produced_rate}%` : '—'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col text-right text-xs">
                                            <span className="text-gray-400">
                                                {skipData ? `${skipData.produced_slots}/${skipData.past_slots || skipData.leader_slots}` : '—'}
                                            </span>
                                            <span className="text-gray-500">
                                                Epoch {skipData?.epoch}: {skipData?.epoch_progress || 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            
                                {/* === NEXT SLOTS === */}
                                <div>
                                    <div className="flex items-center space-x-2 w-full">
                                        <span className="w-32 text-right text-gray-300 h-[60px]">Next Slots</span>
                                        <div className="flex-grow h-[60px]">
                                            {loadingSlots ? (
                                                <div className="text-xs text-gray-400 leading-tight flex items-center">
                                                    <span>Loading...</span>
                                                </div>
                                            ) : nextSlots[0]?.slot ? (
                                                <div className="text-xs text-green-400 leading-tight">
                                                    Next in <strong>{nextSlots[0].windowMinutes} min</strong>
                                                    at <strong>{nextSlots[0].dateWindow}</strong>
                                                    (first slot ~{nextSlots[0].date})<br/>
                                                    Leader slot <strong>#{nextSlots[0].slot}</strong>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-gray-500 leading-tight flex items-center">
                                                    <span>{nextSlots[0]?.date || 'No data'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-[#170e23] rounded-lg p-5 flex-1 w-1/2">
                            <span className="text-xl font-bold mb-4 text-gray-300 mb-2 block">Account Assets</span>
                            <div className="overflow-x-auto">
                                <table className="w-full validator-table text-gray-300">
                                    <thead>
                                        <tr className="border-b border-[#281f32] bg-gray-100">
                                            <th className="text-left py-2 px-4 text-gray-300">Identity</th>
                                            <th className="text-left py-2 px-4 text-gray-300">Vote</th>
                                            <th className="text-left py-2 px-4 text-gray-300">Withdrawer</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-2 px-4 border-b border-[#281f32] break-all" title={validatorData.node_pubkey}>{validatorData.node_pubkey}</td>
                                            <td className="py-2 px-4 border-b border-[#281f32] break-all" title={validatorData.vote_pubkey}>{validatorData.vote_pubkey}</td>
                                            <td className="py-2 px-4 border-b border-[#281f32] break-all" title={loadingWithdrawer ? 'Loading...' : errorWithdrawer ? 'Error' : withdrawer || 'Not found'}>
                                                {loadingWithdrawer ? 'Loading...' : errorWithdrawer ? 'Error' : withdrawer || 'Not found'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
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
                                <ChartErrorBoundary><Line options={optionsLine} data={dataEpoch} /></ChartErrorBoundary>
                            </div>
                            <div className={`w-full ${chartTab === 'stake_accounts' ? 'block' : 'hidden'}`}>
                                <ChartErrorBoundary>
                                    {selfStakeChartData() ? <Line options={optionsSelfStake} data={selfStakeChartData()} /> : <div className="flex items-center justify-center h-full"><div className="text-center">Loading historical self-stake data...</div></div>}
                                </ChartErrorBoundary>
                            </div>
                        </div>
                    </div>

                    <div className="flex mt-6 bg-[#170e23] rounded-lg p-5 flex-1 flex flex-col space-y-4">
                        <span className="text-xl font-bold mb-4 text-white mb-2 block text-gray-300">Stake by Delegators</span>
                        <div className="overflow-x-auto">
                            <table className="w-full validator-table">
                                <thead>
                                    <tr className="border-b border-[#281f32] bg-gray-100">
                                        <th className="text-left py-2 px-4 text-gray-300">Withdrawer</th>
                                        <th className="text-left py-2 px-4 text-gray-300">Name</th>
                                        <th className="text-left py-2 px-4 text-gray-300">Active Stake</th>
                                        <th className="text-left py-2 px-4 text-gray-300">Deactivating</th>
                                        <th className="text-left py-2 px-4 text-gray-300">Activating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300 break-all" title={loadingWithdrawer ? 'Loading...' : errorWithdrawer ? 'Error' : withdrawer || 'Not found'}>
                                            {loadingWithdrawer ? 'Loading...' : errorWithdrawer ? 'Error' : withdrawer || 'Not found'}
                                        </td>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300">vote_value_1</td>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300">withdrawer_value_1</td>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300">withdrawer_value_1</td>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300">withdrawer_value_1</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300 break-all" title={loadingWithdrawer ? 'Loading...' : errorWithdrawer ? 'Error' : withdrawer || 'Not found'}>
                                            {loadingWithdrawer ? 'Loading...' : errorWithdrawer ? 'Error' : withdrawer || 'Not found'}
                                        </td>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300">vote_value_1</td>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300">withdrawer_value_1</td>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300">withdrawer_value_1</td>
                                        <td className="py-2 px-4 border-b border-[#281f32] text-gray-300">withdrawer_value_1</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Заглушки для API (если не работают)
async function fetchValidatorMetrics(votePubkey, validatorIdentityPubkey) { return null; }
async function fetchHistoricalMetrics(votePubkey, validatorIdentityPubkey) { return null; }