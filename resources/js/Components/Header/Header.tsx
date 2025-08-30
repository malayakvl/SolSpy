import { useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from "./ApplicationLogo";
import ActionsMenu from "./ActionsMenu";
import axios from 'axios';
import {useEffect, useState} from "react";
import ProgressBar from "./ProgressBar";

export default function Header(auth) {
  const user = usePage().props.auth.user;
  const appLang = useSelector(appLangSelector);
  const [solRate, setSolRate] = useState({})
  const [epochPersent, setEpochPersent] = useState<any>(0)
  const [settingsData, setSettingsData] = useState('');
  const [settingsFetched, setSettingsFetched] = useState(false)
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [barProgress, setBarProgress] = useState(null);
  const [barProgressCaption, setBarProgressCaption] = useState('');
  const [epochData, setEpochData] = useState({});
  const rpcUrl = 'http://103.167.235.81:8899';

  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/fetch-settings');
      setSolRate(response.data.data.sol_rate)
      setSettingsData(response.data.data);

      const progressPercent = (response.data.data.slot_index / response.data.data.slot_in_epoch) * 100;
      setEpochPersent(progressPercent.toFixed(2));
      // console.log(`Прогрес епохи: ${progressPercent.toFixed(2)}%`);

      const progress = response.data.data.slot_index / response.data.data.slot_in_epoch;
      setBarProgress(progress*10); // надо уточнить
      const slotsLeft = response.data.data.slot_in_epoch - response.data.data.slot_index;
      const timeLeftSeconds = slotsLeft * 0.4; // час до кінця епохи в секундах

      const days = Math.floor(timeLeftSeconds / (24 * 3600));
      const hours = Math.floor((timeLeftSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
      const seconds = Math.floor(timeLeftSeconds % 60);
      setBarProgressCaption(`${days} d, ${hours} h, ${minutes} m`);


      // console.log(`Залишилось: ${days} дн, ${hours} год, ${minutes} хв, ${seconds} сек`);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (!settingsFetched) {
      fetchData();
      setSettingsFetched(true);
    }
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [settingsFetched])

  return (
    <header className="bg-white">
      <div className="bg-gray-200 w-full min-h-[80px] flex align-center justify-between">
        <div className="grid w-full grid-cols-2 items-center gap-1 px-4 lg:grid-cols-2">
          <div className="logo w-[40px] h-[40px]">
            <ApplicationLogo />
          </div>
          <nav className="flex flex-1 justify-end whitespace-nowrap">
            <nav className="flex inline align-middle">
              <div className="md:space-x-4 md:flex md:pr-[30px] inline align-middle pt-[8px] whitespace-nowrap">
                <ProgressBar progress={barProgress*100} caption={`Left ${barProgressCaption}`} />
              </div>
              <div className="md:space-x-4 md:flex md:pr-[30px] inline align-middle pt-[8px] text-[14px] whitespace-nowrap w-[150px]">
                Epoch  {settingsData?.epoch} ({epochPersent}%)
              </div>
              <div className="md:space-x-4 md:flex md:pr-[30px] inline align-middle pt-[8px] text-[14px] whitespace-nowrap">
                1 SOL = {settingsData?.sol_rate}$
              </div>
              <ActionsMenu />
            </nav>
            <nav className="flex flex-3 justify-end inline align-middle text-[14px]">
              {user?.id ? (
                  <Link
                      href={route('dashboard')}
                      className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                  >
                    Logout
                  </Link>
              ) : (
                  <>

                    <Link
                        href="/login"
                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                    >
                      Log in
                    </Link>
                    <Link
                        href="/register"
                        className="rounded-md px-3 py-2 text-black ring-1 ring-transparent transition hover:text-black/70 focus:outline-none focus-visible:ring-[#FF2D20] dark:text-white dark:hover:text-white/80 dark:focus-visible:ring-white"
                    >
                      Register
                    </Link>
                  </>
              )}
            </nav>
          </nav>
        </div>
      </div>
    </header>
  );
}
