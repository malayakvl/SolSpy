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
    faCircleRadiation,
    faMemory,
    faHardDrive,
    faMicrochip
} from '@fortawesome/free-solid-svg-icons';
import { getWithdrawerFromMyValidator } from '../../utils/solana';
import ValidatorCredits from "./Partials/ValidatorCredits";
import ValidatorRate from "./Partials/ValidatorRate";
import ValidatorActivatedStake from "./Partials/ValidatorActivatedStake";
import ValidatorActions from './Partials/ValidatorActions';
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
    const [chartTab, setChartTab] = useState<string>('active_stake');
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
    const [hardwareInfo, setHardwareInfo] = useState<any>(null);
    const [hardwareInfoStatus, setHardwareInfoStatus] = useState<string>('loading'); // 'loading', 'success', 'error'

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
        plugins: { 
            legend: { 
                position: 'top' as const,
                labels: {
                    color: '#c6c9d0'
                }
            }, 
            title: { 
                display: true, 
                text: 'Epoch Credits History',
                color: '#c6c9d0'
            } 
        },
        scales: { 
            y: { 
                beginAtZero: true,
                ticks: {
                    color: '#c6c9d0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                border: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                ticks: {
                    color: '#c6c9d0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                border: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        elements: { 
            point: { 
                radius: 3, 
                hoverRadius: 6 
            }, 
            line: { 
                tension: 0.4 
            } 
        }
    };

    const optionsSelfStake = {
        responsive: true,
        plugins: { 
            legend: { 
                position: 'top' as const,
                labels: {
                    color: '#c6c9d0'
                }
            }, 
            title: { 
                display: true, 
                text: 'Self-Stake History (Epochs 750-849)',
                color: '#c6c9d0'
            } 
        },
        scales: {
            y: { 
                beginAtZero: false, 
                title: { 
                    display: true, 
                    text: 'Self-Stake (SOL)',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                border: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: { 
                title: { 
                    display: true, 
                    text: 'Epoch',
                    color: '#c6c9d0'
                }, 
                ticks: { 
                    color: '#c6c9d0',
                    autoSkip: true, 
                    maxTicksLimit: 20 
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                border: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        elements: { 
            point: { 
                radius: 2, 
                hoverRadius: 6 
            }, 
            line: { 
                tension: 0.4 
            } 
        }
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

    // === НОВАЯ ФУНКЦИЯ: Подготовка данных для графика avg_stake ===
    const avgStakeChartData = () => {
        // Проверяем, есть ли данные epochAverages
        if (!validatorData?.epochAverages || validatorData.epochAverages.length === 0) {
            return null;
        }
        
        // Извлекаем эпохи и значения avg_stake
        const epochs = validatorData.epochAverages.map(item => item.epoch);
        const avgStakeValues = validatorData.epochAverages.map(item => item.avg_stake);
        
        return {
            labels: epochs,
            datasets: [
                {
                    label: 'Avg Stake (SOL)',
                    data: avgStakeValues,
                    fill: false,
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    tension: 0.1
                }
            ]
        };
    };

    // === НОВАЯ ФУНКЦИЯ: Опции для графика avg_stake ===
    const optionsAvgStake = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#c6c9d0'
                }
            },
            title: {
                display: true,
                text: 'Average Stake by Epoch',
                color: '#c6c9d0'
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Stake (SOL)',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Epoch',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0',
                    autoSkip: true,
                    maxTicksLimit: 20
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        elements: {
            point: {
                radius: 2,
                hoverRadius: 6
            },
            line: {
                tension: 0.4
            }
        }
    };

    // === НОВАЯ ФУНКЦИЯ: Подготовка данных для графика avg_uptime ===
    const avgUptimeChartData = () => {
        // Проверяем, есть ли данные epochAverages
        if (!validatorData?.epochAverages || validatorData.epochAverages.length === 0) {
            return null;
        }
        
        // Извлекаем эпохи и значения avg_uptime
        const epochs = validatorData.epochAverages.map(item => item.epoch);
        const avgUptimeValues = validatorData.epochAverages.map(item => item.avg_uptime);
        
        return {
            labels: epochs,
            datasets: [
                {
                    label: 'Avg Uptime (%)',
                    data: avgUptimeValues,
                    fill: false,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1
                }
            ]
        };
    };

    // === НОВАЯ ФУНКЦИЯ: Опции для графика avg_uptime ===
    const optionsAvgUptime = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#c6c9d0'
                }
            },
            title: {
                display: true,
                text: 'Average Uptime by Epoch',
                color: '#c6c9d0'
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Uptime (%)',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Epoch',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0',
                    autoSkip: true,
                    maxTicksLimit: 20
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        elements: {
            point: {
                radius: 2,
                hoverRadius: 6
            },
            line: {
                tension: 0.4
            }
        }
    };

    // === НОВАЯ ФУНКЦИЯ: Подготовка данных для графика avg_commission ===
    const avgCommissionChartData = () => {
        // Проверяем, есть ли данные epochAverages
        if (!validatorData?.epochAverages || validatorData.epochAverages.length === 0) {
            return null;
        }
        
        // Извлекаем эпохи и значения avg_commission
        const epochs = validatorData.epochAverages.map(item => item.epoch);
        const avgCommissionValues = validatorData.epochAverages.map(item => item.avg_commission);
        
        return {
            labels: epochs,
            datasets: [
                {
                    label: 'Avg Commission (%)',
                    data: avgCommissionValues,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1
                }
            ]
        };
    };

    // === НОВАЯ ФУНКЦИЯ: Подготовка данных для графика avg_skip_rate ===
    const avgSkipRateChartData = () => {
        // Проверяем, есть ли данные epochAverages
        if (!validatorData?.epochAverages || validatorData.epochAverages.length === 0) {
            return null;
        }
        
        // Извлекаем эпохи и значения avg_skip_rate
        const epochs = validatorData.epochAverages.map(item => item.epoch);
        const avgSkipRateValues = validatorData.epochAverages.map(item => item.avg_skip_rate);
        
        return {
            labels: epochs,
            datasets: [
                {
                    label: 'Avg Skip Rate (%)',
                    data: avgSkipRateValues,
                    fill: false,
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1
                }
            ]
        };
    };

    // === НОВАЯ ФУНКЦИЯ: Опции для графика avg_commission ===
    const optionsAvgCommission = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#c6c9d0'
                }
            },
            title: {
                display: true,
                text: 'Average Commission by Epoch',
                color: '#c6c9d0'
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Commission (%)',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                border: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Epoch',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0',
                    autoSkip: true,
                    maxTicksLimit: 20
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                border: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        elements: {
            point: {
                radius: 2,
                hoverRadius: 6
            },
            line: {
                tension: 0.4
            }
        }
    };

    // === НОВАЯ ФУНКЦИЯ: Опции для графика avg_skip_rate ===
    const optionsAvgSkipRate = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#c6c9d0'
                }
            },
            title: {
                display: true,
                text: 'Average Skip Rate by Epoch',
                color: '#c6c9d0'
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Skip Rate (%)',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                border: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Epoch',
                    color: '#c6c9d0'
                },
                ticks: {
                    color: '#c6c9d0',
                    autoSkip: true,
                    maxTicksLimit: 20
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                border: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        },
        elements: {
            point: {
                radius: 2,
                hoverRadius: 6
            },
            line: {
                tension: 0.4
            }
        }
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

    // Handle ban toggle from child component
    const handleBanToggle = (validatorId: number, isBanned: boolean) => {
        if (isBanned) {
            // Add to banned list
            setBannedValidators(prev => [...prev, validatorId]);
        } else {
            // Remove from banned list
            setBannedValidators(prev => prev.filter(id => id !== validatorId));
        }
    };


    async function fetchValidatorHardware(ip) {
        if (!ip) return;

        setHardwareInfoStatus('loading');
        setHardwareInfo(null);

        try {
            const resp = await fetch(`/api/validator-hardware?ip=${ip}`);
            const json = await resp.json();

            // metrics missing
            if (json.error || json.status === "metrics_unavailable") {
                setHardwareInfoStatus('success');
                setHardwareInfo({ type: 'unavailable' });
                return;
            }

            // Real data
            if (json.ram_bytes) {
                const ram = (json.ram_bytes / 1024 / 1024 / 1024).toFixed(0);
                const disk = json.disk_bytes 
                    ? (json.disk_bytes / 1024 / 1024 / 1024 / 1024).toFixed(1)
                    : "?";

                setHardwareInfoStatus('success');
                setHardwareInfo({
                    type: 'real',
                    ram,
                    disk
                });
                return;
            }

            // Estimated hardware
            if (json.estimate) {
                setHardwareInfoStatus('success');
                setHardwareInfo({
                    type: 'estimate',
                    estimate: json.estimate
                });
                return;
            }

            // Unknown fallback
            setHardwareInfoStatus('success');
            setHardwareInfo({ type: 'unknown' });

        } catch (e) {
            setHardwareInfoStatus('error');
            setHardwareInfo(null);
        }
    }

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
        if (validatorData?.ip) {
            fetchValidatorHardware(validatorData.ip)
        }
    }, [validatorData?.ip]);

    useEffect(() => {
        const fetchSkipped = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/validator-skipped-slots', {
                    params: { node_pubkey: validatorData.node_pubkey }
                });
                // console.log(res)
                
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

    const fetchData = async () => {
        // Show loading indicator only for pagination and sorting operations
        if (isPaginationOrSorting) {
            setIsLoading(true);
        }
        // Get filter value and other parameters from current URL
        const urlParams = new URLSearchParams(window.location.search);
        const validatorId = validatorData.id;
        const currentPageFromUrl = parseInt(urlParams.get('page')) || 1;
        try {
            // Build URL with all parameters
            // Use authenticated endpoint if user is logged in, otherwise use public endpoint
            let url = user ? 
                `/api/fetch-validators-auth?page=1&validatorId=${validatorId}` :
                `/api/fetch-validators?page=1&validatorId=${validatorId}`;
                
            if (searchParam) {
                url += `&search=${encodeURIComponent(searchParam)}`;
            }
            console.log(url);
            const response = await axios.get(url);

            // console.log('Fetched data:', response.data); // Add this line to debug
            setData(response.data.validatorsData);
            // setTotalRecords(response.data.totalCount);
            
            // Mark that we've fetched data at least once
            if (!dataFetched) {
                setDataFetched(true);
            }
            
            // Reset sort click state after data is fetched
            setSortClickState(null);
        } catch (error) {
            console.error('Error:', error);
            // Reset sort click state even if there's an error
            setSortClickState(null);
        } finally {
            // Hide loading indicator after pagination and sorting operations
            if (isPaginationOrSorting) {
                setIsLoading(false);
                // Reset the flag
                setIsPaginationOrSorting(false);
            }
        }
    };

    // useEffect(() => {
    //     console.log(validatorData)
    //     // Set up interval for periodic data fetching
    //     const intervalId = setInterval(() => {
    //         fetchData();
    //     }, parseInt(validatorsData.settingsData.update_interval) * 1000);
        
    //     // Listen for filter changes
    //     const handleFilterChange = () => {
    //         // Reset to first page when filter changes
    //         setCurrentPage(1);
    //     };
        
    //     window.addEventListener('filterChanged', handleFilterChange);
        
    //     return () => {
    //         clearInterval(intervalId);
    //         window.removeEventListener('filterChanged', handleFilterChange);
    //     };
    // }, []);

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
                                    <div className="flex">
                                        <ValidatorActions validator={validatorData} onBanToggle={handleBanToggle} showViewBtn={false} />
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
                                        <span className="flex-1">
                                            <ValidatorActivatedStake validator={data} epoch={epoch} />
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
                                    <li className="flex items-start">
                                        <span className="font-medium mr-2 w-40 whitespace-nowrap">TVC Score:</span>
                                        <span className="break-all flex-1">
                                            <ValidatorTVCScore validator={validatorData} />
                                        </span>
                                    </li>
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
                                        <span className="w-32 text-right text-gray-3300">Skipped Slots</span>
            
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
                                                    Next in <strong>{nextSlots[0].windowMinutes} min</strong>&nbsp;
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
                                <li onClick={() => setChartTab('uptime')} className={`px-4 py-2 font-medium text-md cursor-pointer ${chartTab === 'uptime' ? 'bg-[#703da7] text-white' : 'text-[#c6c9d0] hover:text-[#703da7]'}`}>Uptime</li>
                                <li onClick={() => setChartTab('skip_rate')} className={`px-4 py-2 font-medium text-md cursor-pointer ${chartTab === 'skip_rate' ? 'bg-[#703da7] text-white' : 'text-[#c6c9d0] hover:text-[#703da7]'}`}>Skip Rate</li>
                                <li onClick={() => setChartTab('active_stake')} className={`px-4 py-2 font-medium text-md cursor-pointer ${chartTab === 'active_stake' ? 'bg-[#703da7] text-white' : 'text-[#c6c9d0] hover:text-[#703da7]'}`}>Active Stake</li>
                                <li onClick={() => setChartTab('commission')} className={`px-4 py-2 font-medium text-md cursor-pointer ${chartTab === 'commission' ? 'bg-[#703da7] text-white' : 'text-[#c6c9d0] hover:text-[#703da7]'}`}>Commission</li>
                            </ul>
                            <div className={`w-full ${chartTab === 'uptime' ? 'block' : 'hidden'}`}>
                                <ChartErrorBoundary>
                                    {avgUptimeChartData() ? (
                                        <Line options={optionsAvgUptime} data={avgUptimeChartData()} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">Loading average uptime data...</div>
                                        </div>
                                    )}
                                </ChartErrorBoundary>
                            </div>
                            <div className={`w-full ${chartTab === 'commission' ? 'block' : 'hidden'}`}>
                                <ChartErrorBoundary>
                                    {avgCommissionChartData() ? (
                                        <Line options={optionsAvgCommission} data={avgCommissionChartData()} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">Loading average commission data...</div>
                                        </div>
                                    )}
                                </ChartErrorBoundary>
                            </div>
                            <div className={`w-full ${chartTab === 'skip_rate' ? 'block' : 'hidden'}`}>
                                <ChartErrorBoundary>
                                    {avgSkipRateChartData() ? (
                                        <Line options={optionsAvgSkipRate} data={avgSkipRateChartData()} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">Loading average skip rate data...</div>
                                        </div>
                                    )}
                                </ChartErrorBoundary>
                            </div>
                            <div className={`w-full ${chartTab === 'stake_accounts' ? 'block' : 'hidden'}`}>
                                <ChartErrorBoundary>
                                    {selfStakeChartData() ? <Line options={optionsSelfStake} data={selfStakeChartData()} /> : <div className="flex items-center justify-center h-full"><div className="text-center">Loading historical self-stake data...</div></div>}
                                </ChartErrorBoundary>
                            </div>
                            <div className={`w-full ${chartTab === 'active_stake' ? 'block' : 'hidden'}`}>
                                <ChartErrorBoundary>
                                    {avgStakeChartData() ? (
                                        <Line options={optionsAvgStake} data={avgStakeChartData()} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">Loading average stake data...</div>
                                        </div>
                                    )}
                                </ChartErrorBoundary>
                            </div>

                        </div>
                    </div>
                    
                    {/* === HARDWARE INFO === */}
                    <div className="flex items-start mt-6">
                        <div id="hardware-info" className="flex flex-col gap-2 text-sm text-gray-300">
                            {hardwareInfoStatus === 'loading' && (
                                <div className="flex items-center gap-2 animate-pulse">
                                    <span className="w-4 h-4 bg-gray-600 rounded" />
                                    <span className="w-20 h-3 bg-gray-600 rounded" />
                                    <span className="w-12 h-3 bg-gray-600 rounded" />
                                </div>
                            )}

                            {hardwareInfoStatus === 'success' && hardwareInfo && (
                                <div className="flex flex-col gap-1">
                                    {hardwareInfo.type === 'unavailable' && (
                                        <div className="text-gray-400">Unknown (no metrics exposed)</div>
                                    )}

                                    {hardwareInfo.type === 'real' && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faMemory} className="text-purple-400" />
                                                <span className="bg-purple-900/40 px-2 py-0.5 rounded text-purple-300 text-xs">RAM: {hardwareInfo.ram} GB</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faHardDrive} className="text-blue-400" />
                                                <span className="bg-blue-900/40 px-2 py-0.5 rounded text-blue-300 text-xs">SSD: {hardwareInfo.disk} TB</span>
                                            </div>
                                        </>
                                    )}

                                    {hardwareInfo.type === 'estimate' && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faMicrochip} className="text-green-400" />
                                                <span className="bg-green-900/40 px-2 py-0.5 rounded text-green-300 text-xs">
                                                    CPU: ~{hardwareInfo.estimate.cpu_cores_median}c ({hardwareInfo.estimate.cpu_cores_range[0]}–{hardwareInfo.estimate.cpu_cores_range[1]})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faMemory} className="text-purple-400" />
                                                <span className="bg-purple-900/40 px-2 py-0.5 rounded text-purple-300 text-xs">
                                                    RAM: ~{hardwareInfo.estimate.ram_gb_median}GB ({hardwareInfo.estimate.ram_gb_range[0]}–{hardwareInfo.estimate.ram_gb_range[1]})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FontAwesomeIcon icon={faHardDrive} className="text-blue-400" />
                                                <span className="bg-blue-900/40 px-2 py-0.5 rounded text-blue-300 text-xs">
                                                    SSD: {hardwareInfo.estimate.disk}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-400 italic hidden">
                                                <span className="bg-blue-900/40 px-2 py-0.5 rounded text-blue-300 text-xs">
                                                    confidence {hardwareInfo.estimate.confidence}%
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {hardwareInfo.type === 'unknown' && (
                                        <span className="text-gray-500">Unknown</span>
                                    )}
                                </div>
                            )}

                            {hardwareInfoStatus === 'error' && (
                                <span className="text-red-400">Hardware fetch error</span>
                            )}
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